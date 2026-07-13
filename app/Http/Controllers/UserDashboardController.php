<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Reservation;

class UserDashboardController extends Controller
{
    public function profile()
    {
        $user = Auth::user();
        
        $reservations = Reservation::where('user_id', $user->id)
            ->with(['items.product', 'items.inventory'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Perfil', [
            'user' => $user,
            'reservations' => $reservations
        ]);
    }
}
