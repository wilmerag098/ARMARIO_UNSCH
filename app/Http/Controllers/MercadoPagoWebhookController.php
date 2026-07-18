<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Payment\PaymentClient;
use Illuminate\Support\Facades\Log;
use Exception;

class MercadoPagoWebhookController extends Controller
{
    /**
     * Handle incoming webhooks from MercadoPago.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handle(Request $request)
    {
        Log::info('MercadoPago Webhook received: ', $request->all());

        // MercadoPago events can send type or topic, and ID in data.id or raw id
        $type = $request->input('type') ?? $request->input('topic');
        $dataId = $request->input('data.id') ?? $request->input('id');

        if ($type === 'payment' && $dataId) {
            try {
                $token = config('services.mercadopago.token');
                if (!$token) {
                    Log::error('MercadoPago Access Token is not set in config/services.php.');
                    return response()->json(['error' => 'Configuration error'], 500);
                }

                MercadoPagoConfig::setAccessToken($token);

                if (config('app.env') === 'local') {
                    MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);
                }

                $client = new PaymentClient();
                $payment = $client->get($dataId);

                if (!$payment) {
                    Log::warning("Payment ID {$dataId} not found in MercadoPago.");
                    return response()->json(['error' => 'Payment not found'], 404);
                }

                $orderNumber = $payment->external_reference;
                $status = $payment->status;
                Log::info("MercadoPago payment details - Order: {$orderNumber}, Status: {$status}, Payment ID: {$dataId}");

                if ($status === 'approved') {
                    $reservation = Reservation::where('order_number', $orderNumber)->first();
                    
                    if ($reservation) {
                        // Prevent duplicate state changes
                        if ($reservation->payment_status !== 'pagado') {
                            $reservation->update([
                                'payment_status' => 'pagado',
                                'status' => 'confirmada', // Confirm the reservation automatically
                                'payment_reference' => (string) $dataId,
                            ]);
                            Log::info("Reservation #{$orderNumber} updated successfully to 'pagado' and 'confirmada'.");
                        } else {
                            Log::info("Reservation #{$orderNumber} was already marked as paid.");
                        }
                    } else {
                        Log::warning("Reservation with Order Number #{$orderNumber} not found in database.");
                    }
                }
            } catch (Exception $e) {
                Log::error('Error processing MercadoPago webhook payment check: ' . $e->getMessage(), [
                    'exception' => $e
                ]);
                // Return 500 so MercadoPago retries the event if there is a temporary DB/connection issue
                return response()->json(['error' => 'Internal server error'], 500);
            }
        }

        // Always return 200 OK so MercadoPago knows we received the webhook
        return response()->json(['status' => 'success'], 200);
    }
}
