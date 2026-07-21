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
use MercadoPago\Client\Payment\PaymentClient;

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
            'promotion' => $promotion,
            'mercadopago_public_key' => config('services.mercadopago.key')
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
            'payment_method' => 'required|string|in:yape,plin,mercadopago_card,mercadopago_wallet,mercadopago_yape',
            'payment_reference' => 'required_if:payment_method,yape,plin|nullable|string|min:8|max:20',
            // Campos para integración avanzada de Mercado Pago
            'payment_token' => 'required_if:payment_method,mercadopago_card|nullable|string',
            'payment_method_id' => 'required_if:payment_method,mercadopago_card|nullable|string',
            'installments' => 'required_if:payment_method,mercadopago_card|nullable|integer',
            'issuer_id' => 'nullable|string',
            'yape_phone' => 'nullable|string|max:20',
            'yape_approval_code' => 'nullable|string|max:10',
            // Opcionalmente actualizar perfil de usuario si es enviado
            'name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'dni' => 'nullable|string|max:20|unique:users,dni,' . Auth::id(),
            'university_id' => 'nullable|string|max:255|unique:users,university_id,' . Auth::id(),
            'phone' => 'nullable|string|max:20',
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

        // Calculate guarantee amount
        $securityDeposit = floatval($product->security_deposit);
        if ($securityDeposit <= 0) {
            $securityDeposit = floatval($product->discounted_price_per_day) * 0.20;
        }

        if (!empty($validated['accessories'])) {
            foreach ($validated['accessories'] as $accData) {
                $accProduct = Product::where('status', 'active')->findOrFail($accData['product_id']);
                $accDeposit = floatval($accProduct->security_deposit);
                if ($accDeposit <= 0) {
                    $accDeposit = floatval($accProduct->price_per_day) * 0.20;
                }
                $securityDeposit += $accDeposit;
            }
        }

        // Total = mainSubtotal + accessoriesSubtotal - discountAmount + securityDeposit
        $totalAmount = $mainSubtotal + $accessoriesSubtotal - $discountAmount + $securityDeposit;

        // Actualizar perfil de usuario si es enviado y difiere
        $user = Auth::user();
        if ($user) {
            $userUpdateData = [];
            if ($request->filled('name') && $request->name !== $user->name) {
                $userUpdateData['name'] = $request->name;
            }
            if ($request->filled('last_name') && $request->last_name !== $user->last_name) {
                $userUpdateData['last_name'] = $request->last_name;
            }
            if ($request->filled('dni') && $request->dni !== $user->dni) {
                $userUpdateData['dni'] = $request->dni;
            }
            if ($request->filled('university_id') && $request->university_id !== $user->university_id) {
                $userUpdateData['university_id'] = $request->university_id;
            }
            if ($request->filled('phone') && $request->phone !== $user->phone) {
                $userUpdateData['phone'] = $request->phone;
            }
            if (!empty($userUpdateData)) {
                $user->update($userUpdateData);
            }
        }

        // Generate unique order number
        $orderNumber = 'RES-' . strtoupper(uniqid());

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'order_number' => $orderNumber,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_amount' => $totalAmount,
            'guarantee_amount' => $securityDeposit,
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

        if ($validated['payment_method'] === 'mercadopago_card') {
            try {
                $token = config('services.mercadopago.token');
                if (!$token) {
                    throw new \Exception('El token de acceso de MercadoPago no está configurado.');
                }

                MercadoPagoConfig::setAccessToken($token);

                if (config('app.env') === 'local') {
                    MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
                }

                $client = new PaymentClient();
                
                $paymentRequest = [
                    "transaction_amount" => (float) $totalAmount,
                    "token" => $validated['payment_token'],
                    "description" => "Alquiler de Prenda - Orden " . $orderNumber,
                    "installments" => (int) $validated['installments'],
                    "payment_method_id" => $validated['payment_method_id'],
                    "payer" => [
                        "email" => $user->email,
                        "identification" => [
                            "type" => "DNI",
                            "number" => $user->dni
                        ]
                    ]
                ];

                if (!empty($validated['issuer_id'])) {
                    $paymentRequest["issuer_id"] = $validated['issuer_id'];
                }

                $payment = $client->create($paymentRequest);

                if ($payment && $payment->status === 'approved') {
                    // El pago fue aprobado con éxito
                    $reservation->update([
                        'payment_status' => 'pagado',
                        'status' => 'confirmada',
                        'payment_reference' => (string) $payment->id
                    ]);
                    
                    return redirect()->route('perfil')->with('success', '¡Reserva confirmada y pago aprobado!');
                } else {
                    // Si el pago no fue aprobado (ej. rechazado, pendiente, en proceso)
                    $statusDetail = $payment ? ($payment->status_detail ?? $payment->status) : 'desconocido';
                    
                    // Eliminar la reserva y sus items si el pago no fue aprobado
                    $reservation->delete();
                    
                    $errorMsg = 'El pago fue rechazado o está en proceso. Estado: ' . $statusDetail;
                    if ($statusDetail === 'cc_rejected_bad_filled_card_number') {
                        $errorMsg = 'Número de tarjeta incorrecto. Verifica los datos.';
                    } elseif ($statusDetail === 'cc_rejected_bad_filled_date') {
                        $errorMsg = 'Fecha de expiración incorrecta. Verifica los datos.';
                    } elseif ($statusDetail === 'cc_rejected_bad_filled_other') {
                        $errorMsg = 'Datos de la tarjeta incorrectos. Verifica los datos.';
                    } elseif ($statusDetail === 'cc_rejected_bad_filled_security_code') {
                        $errorMsg = 'Código de seguridad incorrecto.';
                    } elseif ($statusDetail === 'cc_rejected_blacklist') {
                        $errorMsg = 'La tarjeta está en la lista negra. Usa otra tarjeta.';
                    } elseif ($statusDetail === 'cc_rejected_call_for_authorize') {
                        $errorMsg = 'El pago requiere autorización de tu banco.';
                    } elseif ($statusDetail === 'cc_rejected_card_disabled') {
                        $errorMsg = 'La tarjeta está desactivada. Llama a tu banco o usa otra tarjeta.';
                    } elseif ($statusDetail === 'cc_rejected_duplicated_payment') {
                        $errorMsg = 'Transacción duplicada. Por favor espera unos minutos.';
                    } elseif ($statusDetail === 'cc_rejected_high_risk') {
                        $errorMsg = 'Pago rechazado por políticas de prevención de fraude.';
                    } elseif ($statusDetail === 'cc_rejected_insufficient_amount') {
                        $errorMsg = 'Fondos insuficientes en la tarjeta.';
                    } elseif ($statusDetail === 'cc_rejected_invalid_installments') {
                        $errorMsg = 'Número de cuotas no permitido para esta tarjeta.';
                    } elseif ($statusDetail === 'cc_rejected_max_attempts') {
                        $errorMsg = 'Superaste el límite de intentos permitidos. Intenta mañana.';
                    } elseif ($statusDetail === 'cc_rejected_other_reason') {
                        $errorMsg = 'El pago fue rechazado por el banco emisor.';
                    }
                    
                    return redirect()->back()->withErrors([
                        'payment_method' => 'Error en el cobro: ' . $errorMsg
                    ]);
                }
            } catch (\Exception $e) {
                // Eliminar la reserva si falló la API
                if (isset($reservation)) {
                    $reservation->delete();
                }

                $details = null;
                if (method_exists($e, 'getApiResponse')) {
                    $apiResponse = $e->getApiResponse();
                    if ($apiResponse) {
                        $details = $apiResponse->getContent();
                    }
                }
                
                \Illuminate\Support\Facades\Log::error('Error cobrando con tarjeta en MercadoPago: ' . $e->getMessage(), [
                    'exception' => $e,
                    'details' => $details
                ]);
                
                $errorMessage = 'No se pudo procesar el pago seguro: ' . $e->getMessage();
                if ($details) {
                    $decoded = is_array($details) ? $details : json_decode($details, true);
                    if (is_array($decoded)) {
                        if (isset($decoded['message'])) {
                            $errorMessage .= ' - ' . $decoded['message'];
                        } elseif (isset($decoded['cause'][0]['description'])) {
                            $errorMessage .= ' - ' . $decoded['cause'][0]['description'];
                        } else {
                            $errorMessage .= ' - ' . json_encode($decoded);
                        }
                    } else {
                        $errorMessage .= ' - ' . substr((string) $details, 0, 100);
                    }
                }

                return redirect()->back()->withErrors([
                    'payment_method' => $errorMessage
                ]);
            }
        }

        if (in_array($validated['payment_method'], ['mercadopago_wallet', 'mercadopago_yape'])) {
            try {
                $token = config('services.mercadopago.token');
                if (!$token) {
                    throw new \Exception('El token de acceso de MercadoPago no está configurado.');
                }

                MercadoPagoConfig::setAccessToken($token);

                // Si se seleccionó Yape y se proporcionó el Código de Aprobación OTP, procesar cobro directo
                if ($validated['payment_method'] === 'mercadopago_yape' && !empty($validated['yape_approval_code'])) {
                    $paymentClient = new PaymentClient();

                    $yapePhoneNum = preg_replace('/\D/', '', $validated['yape_phone'] ?? $validated['phone'] ?? '');
                    if (empty($yapePhoneNum)) {
                        $yapePhoneNum = '999999999';
                    }

                    $paymentRequest = [
                        "transaction_amount" => (float) $totalAmount,
                        "description" => "Alquiler de Prenda - Orden " . $orderNumber,
                        "payment_method_id" => "yape",
                        "token" => trim($validated['yape_approval_code']),
                        "payer" => [
                            "email" => $validated['email'] ?? $user->email,
                            "phone" => [
                                "area_code" => "51",
                                "number" => $yapePhoneNum,
                            ],
                        ],
                        "external_reference" => (string) $orderNumber,
                    ];

                    try {
                        $payment = $paymentClient->create($paymentRequest);

                        if ($payment->status === 'approved') {
                            $reservation->update([
                                'payment_status' => 'pagado',
                                'status' => 'confirmada',
                                'payment_reference' => (string) $payment->id,
                            ]);

                            return redirect()->route('perfil', ['payment_status' => 'success']);
                        } else {
                            if (isset($reservation)) {
                                $reservation->delete();
                            }

                            $statusDetail = $payment->status_detail ?? '';
                            $errorMessage = match ($statusDetail) {
                                'cc_rejected_invalid_otp', 'invalid_yape_otp' => 'El código de aprobación de Yape es incorrecto o venció.',
                                'cc_rejected_insufficient_amount' => 'Tu cuenta de Yape no cuenta con saldo suficiente.',
                                'cc_rejected_high_risk' => 'El pago fue rechazado por seguridad en tu App Yape.',
                                default => 'No se pudo procesar el Yapeo (' . ($payment->status_detail ?? 'rechazado') . '). Verifica tu celular y código.',
                            };

                            return redirect()->back()->withErrors([
                                'payment_method' => $errorMessage
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning('Error en cobro directo Yape OTP: ' . $e->getMessage());
                        if (isset($reservation)) {
                            $reservation->delete();
                        }
                        return redirect()->back()->withErrors([
                            'payment_method' => 'No se pudo procesar el código de Yape: ' . $e->getMessage()
                        ]);
                    }
                }

                $client = new PreferenceClient();
                
                $appUrl = str_replace('127.0.0.1', 'localhost', rtrim($request->schemeAndHttpHost(), '/'));
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
                        "success" => $appUrl . '/perfil?payment_status=success',
                        "failure" => $appUrl . '/catalogo?payment_status=failure',
                        "pending" => $appUrl . '/perfil?payment_status=pending',
                    ],
                    "external_reference" => (string) $orderNumber,
                ];

                if (str_starts_with($appUrl, 'https')) {
                    $preferenceData["auto_return"] = "approved";
                }

                if ($validated['payment_method'] === 'mercadopago_yape') {
                    $preferenceData["payment_methods"] = [
                        "default_payment_method_id" => "yape"
                    ];
                }

                // Excluir notification_url en local para evitar error de MP si no es HTTPS público
                $webhookUrl = route('webhooks.mercadopago');
                if (!str_contains($webhookUrl, 'localhost') && !str_contains($webhookUrl, '127.0.0.1')) {
                    $preferenceData["notification_url"] = $webhookUrl;
                }

                try {
                    $preference = $client->create($preferenceData);
                } catch (\Exception $subEx) {
                    if (isset($preferenceData["payment_methods"])) {
                        unset($preferenceData["payment_methods"]);
                        $preference = $client->create($preferenceData);
                    } else {
                        throw $subEx;
                    }
                }

                $initPoint = (str_starts_with($token, 'TEST-') && !empty($preference->sandbox_init_point))
                    ? $preference->sandbox_init_point
                    : ($preference->init_point ?? $preference->sandbox_init_point);

                return Inertia::location($initPoint);
            } catch (\Exception $e) {
                if (isset($reservation)) {
                    $reservation->delete();
                }

                $apiResponseDetails = null;
                if (method_exists($e, 'getApiResponse')) {
                    $apiResponseDetails = $e->getApiResponse()?->getContent();
                }

                \Illuminate\Support\Facades\Log::error('Error creando preferencia MercadoPago (' . $validated['payment_method'] . '): ' . $e->getMessage(), [
                    'details' => $apiResponseDetails
                ]);

                $errorText = 'No se pudo generar el enlace de cobro con Mercado Pago: ' . $e->getMessage();
                if ($apiResponseDetails) {
                    $decoded = is_array($apiResponseDetails) ? $apiResponseDetails : json_decode($apiResponseDetails, true);
                    if (is_array($decoded) && isset($decoded['message'])) {
                        $errorText .= ' (' . $decoded['message'] . ')';
                    }
                }

                return redirect()->back()->withErrors([
                    'payment_method' => $errorText
                ]);
            }
        }

        return redirect()->route('perfil')->with('success', '¡Reserva confirmada!');
    }

    public function fastRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'dni' => 'required|string|max:20|unique:users,dni',
            'university_id' => 'required|string|max:255|unique:users,university_id',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'last_name' => $validated['last_name'],
            'dni' => $validated['dni'],
            'university_id' => $validated['university_id'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'email_verified_at' => now(),
            'role' => 'user',
        ]);

        Auth::login($user);

        return back();
    }
}
