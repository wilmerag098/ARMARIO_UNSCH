<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Reservation;
use App\Models\Product;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;

class UserDashboardController extends Controller
{
    public function profile(Request $request)
    {
        $user = Auth::user();

        // Verificación de callback de Mercado Pago (Redirect Fallback)
        $paymentId = $request->query('payment_id');
        $status = $request->query('status');

        if ($paymentId && $status === 'approved') {
            try {
                $token = config('services.mercadopago.token');
                if ($token) {
                    MercadoPagoConfig::setAccessToken($token);
                    if (config('app.env') === 'local') {
                        MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
                    }

                    $client = new PaymentClient();
                    $payment = $client->get($paymentId);

                    if ($payment && $payment->status === 'approved') {
                        $orderNumber = $payment->external_reference;
                        $reservation = Reservation::where('order_number', $orderNumber)
                            ->where('user_id', $user->id)
                            ->first();

                        if ($reservation && $reservation->payment_status !== 'pagado') {
                            $reservation->update([
                                'payment_status' => 'pagado',
                                'status' => 'confirmada',
                                'payment_reference' => (string) $paymentId,
                            ]);
                            \Illuminate\Support\Facades\Log::info("Reservation #{$orderNumber} updated via redirect callback verification. Payment ID: {$paymentId}");
                        }
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error verifying payment in redirect callback: ' . $e->getMessage(), [
                    'exception' => $e
                ]);
            }
        }
        
        $reservations = Reservation::where('user_id', $user->id)
            ->with(['items.product', 'items.inventory'])
            ->orderBy('created_at', 'desc')
            ->get();

        $favorites = $user->favorites()->with('inventories')->get();

        return Inertia::render('Perfil', [
            'user' => $user,
            'reservations' => $reservations,
            'favorites' => $favorites
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $user->update([
            'name' => $request->name,
            'phone' => $request->phone
        ]);

        return redirect()->back()->with('success', 'Perfil de usuario actualizado correctamente.');
    }

    public function cancelReservation(Reservation $reservation)
    {
        if ($reservation->user_id !== Auth::id()) {
            abort(403);
        }

        if ($reservation->status !== 'pendiente') {
            return redirect()->back()->with('error', 'Solo se pueden cancelar reservas en estado pendiente.');
        }

        $reservation->update([
            'status' => 'rechazada'
        ]);

        // Liberar prendas físicas
        $reservation->load('items.inventory');
        foreach ($reservation->items as $item) {
            if ($item->inventory) {
                $item->inventory->update(['status' => 'available']);
            }
        }

        return redirect()->back()->with('success', 'Reserva cancelada correctamente y stock liberado.');
    }

    public function toggleFavorite(Product $product)
    {
        $user = Auth::user();
        $user->favorites()->toggle($product->id);

        return redirect()->back()->with('success', 'Lista de favoritos actualizada.');
    }

    public function requestRefund(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== Auth::id()) {
            abort(403);
        }

        if ($reservation->status !== 'devuelta') {
            return redirect()->back()->with('error', 'Solo se puede solicitar reembolso de prendas devueltas.');
        }

        $request->validate([
            'refund_method' => 'required|string|in:yape,plin,transferencia',
            'refund_details' => 'required|string|max:500'
        ]);

        $reservation->update([
            'refund_requested' => true,
            'refund_method' => $request->refund_method,
            'refund_details' => $request->refund_details
        ]);

        return redirect()->back()->with('success', 'Solicitud de reembolso enviada correctamente. El administrador la procesará pronto.');
    }
}
