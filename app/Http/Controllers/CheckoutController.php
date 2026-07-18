<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Illuminate\Support\Facades\Auth;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

class CheckoutController extends Controller
{
    public function index(Product $product)
    {
        if ($product->status !== 'active') {
            abort(404);
        }

        $product->load('category', 'inventories');
        
        $accessories = Product::where('status', 'active')->whereHas('category', function ($query) {
            $query->where('slug', 'accesorios');
        })->with(['category', 'inventories' => function ($query) {
            $query->where('status', 'available');
        }])->get();

        $promotion = \App\Models\Promotion::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->first();

        return Inertia::render('Checkout', [
            'product' => $product,
            'accessories' => $accessories,
            'promotion' => $promotion
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'inventory_id' => 'required|exists:inventories,id',
            'color' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'accessories' => 'nullable|array',
            'accessories.*.product_id' => 'required|exists:products,id',
            'accessories.*.inventory_id' => 'required|exists:inventories,id',
            'payment_method' => 'required|string|in:yape,plin,mercadopago',
            'payment_reference' => 'required_if:payment_method,yape,plin|nullable|string|min:8|max:20',
        ]);

        $product = Product::where('status', 'active')->findOrFail($validated['product_id']);
        
        $days = \Carbon\Carbon::parse($validated['start_date'])->diffInDays(\Carbon\Carbon::parse($validated['end_date'])) + 1;
        $mainSubtotal = $product->discounted_price_per_day * $days;

        // Load active promotion
        $promotion = \App\Models\Promotion::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->first();

        $discountAmount = 0.00;
        $appliedPromotionId = null;

        // Condition check: main item subtotal > promotion min_amount
        $isPromoApplicable = $promotion && ($mainSubtotal > $promotion->min_amount);

        if ($isPromoApplicable) {
            $appliedPromotionId = $promotion->id;
        }

        $itemsToCreate = [
            [
                'product_id' => $product->id,
                'inventory_id' => $validated['inventory_id'],
                'color' => $validated['color'] ?? null,
                'price_at_time' => $product->discounted_price_per_day,
                'subtotal' => $mainSubtotal
            ]
        ];

        $accessoriesSubtotal = 0.00;

        if (!empty($validated['accessories'])) {
            foreach ($validated['accessories'] as $accData) {
                $accProduct = Product::where('status', 'active')->with('category')->findOrFail($accData['product_id']);
                $accSubtotal = $accProduct->discounted_price_per_day * $days;
                
                if ($isPromoApplicable && $accProduct->category && $accProduct->category->slug === 'accesorios') {
                    $itemDiscount = $accSubtotal * ($promotion->discount_percentage / 100.00);
                    $discountAmount += $itemDiscount;
                    $accSubtotalAfterDiscount = $accSubtotal - $itemDiscount;
                } else {
                    $accSubtotalAfterDiscount = $accSubtotal;
                }

                $itemsToCreate[] = [
                    'product_id' => $accProduct->id,
                    'inventory_id' => $accData['inventory_id'],
                    'color' => null,
                    'price_at_time' => $accProduct->price_per_day,
                    'subtotal' => $accSubtotalAfterDiscount
                ];

                $accessoriesSubtotal += $accSubtotal;
            }
        }

        $serviceFee = 15.00;
        $totalAmount = $mainSubtotal + $accessoriesSubtotal - $discountAmount + $serviceFee;

        // Generate unique order number
        $orderNumber = 'RES-' . strtoupper(uniqid());

        $reservation = Reservation::create([
            'user_id' => Auth::id(),
            'order_number' => $orderNumber,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_amount' => $totalAmount,
            'discount_amount' => $discountAmount,
            'promotion_id' => $appliedPromotionId,
            'payment_method' => $validated['payment_method'],
            'payment_reference' => $validated['payment_reference'] ?? 'PENDIENTE_MP',
            'status' => 'pendiente'
        ]);

        foreach ($itemsToCreate as $item) {
            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'product_id' => $item['product_id'],
                'inventory_id' => $item['inventory_id'],
                'color' => $item['color'] ?? null,
                'price_at_time' => $item['price_at_time'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'subtotal' => $item['subtotal']
            ]);
        }

        if ($validated['payment_method'] === 'mercadopago') {
            try {
                $token = config('services.mercadopago.token');
                if (!$token) {
                    throw new \Exception('El token de acceso de MercadoPago no está configurado.');
                }

                MercadoPagoConfig::setAccessToken($token);

                if (config('app.env') === 'local') {
                    MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
                }

                $client = new PreferenceClient();
                
                $preferenceData = [
                    "items" => [
                        [
                            "id" => (string) $product->id,
                            "title" => "Alquiler de Prenda - Orden " . $orderNumber,
                            "quantity" => 1,
                            "unit_price" => (float) $totalAmount,
                            "currency_id" => "PEN"
                        ]
                    ],
                    "back_urls" => [
                        "success" => route('perfil', ['payment_status' => 'success']),
                        "failure" => route('catalogo', ['payment_status' => 'failure']),
                        "pending" => route('perfil', ['payment_status' => 'pending']),
                    ],
                    "auto_return" => "approved",
                    "external_reference" => (string) $orderNumber,
                ];

                // Excluir notification_url si es localhost/127.0.0.1 para evitar error 400 de MercadoPago API
                $webhookUrl = route('webhooks.mercadopago');
                if (!str_contains($webhookUrl, 'localhost') && !str_contains($webhookUrl, '127.0.0.1')) {
                    $preferenceData["notification_url"] = $webhookUrl;
                }

                $preference = $client->create($preferenceData);

                return redirect()->away($preference->init_point);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error creando preferencia en MercadoPago: ' . $e->getMessage(), [
                    'exception' => $e
                ]);
                return redirect()->back()->withErrors([
                    'payment_method' => 'No se pudo generar el enlace de pago seguro: ' . $e->getMessage()
                ]);
            }
        }

        return redirect()->route('perfil')->with('success', '¡Reserva confirmada!');
    }

    public function fastRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'university_id' => 'nullable|string|max:255|unique:users',
            'address' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'university_id' => $validated['university_id'],
            'address' => $validated['address'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        Auth::login($user);

        return back();
    }
}
