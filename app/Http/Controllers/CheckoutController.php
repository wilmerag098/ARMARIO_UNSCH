<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    public function index(Product $product)
    {
        $product->load('category', 'inventories');
        
        return Inertia::render('Checkout', [
            'product' => $product
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'inventory_id' => 'required|exists:inventories,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        
        $days = \Carbon\Carbon::parse($validated['start_date'])->diffInDays(\Carbon\Carbon::parse($validated['end_date'])) + 1;
        $subtotal = $product->price_per_day * $days;
        $totalAmount = $subtotal + 15;

        // Generate unique order number
        $orderNumber = 'RES-' . strtoupper(uniqid());

        $reservation = Reservation::create([
            'user_id' => Auth::id(),
            'order_number' => $orderNumber,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_amount' => $totalAmount,
            'status' => 'pendiente'
        ]);

        ReservationItem::create([
            'reservation_id' => $reservation->id,
            'product_id' => $product->id,
            'inventory_id' => $validated['inventory_id'],
            'price_at_time' => $product->price_per_day,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'subtotal' => $subtotal
        ]);

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
