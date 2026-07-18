<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Reservation;
use App\Models\Product;

class UserDashboardController extends Controller
{
    public function profile()
    {
        $user = Auth::user();
        
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
}
