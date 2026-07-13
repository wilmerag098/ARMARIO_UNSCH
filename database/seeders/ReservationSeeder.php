<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Reservation;
use App\Models\ReservationItem;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have some users
        $user1 = User::where('email', 'ana.garcia@unsch.edu.pe')->first();
        
        if (!$user1) {
            $user1 = User::create([
                'name' => 'Ana García',
                'email' => 'ana.garcia@unsch.edu.pe',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'university_id' => '20210459',
                'phone' => '+51 987 654 321',
                'role' => 'user'
            ]);
        }

        // Create a few more users to have variety in the dashboard
        $users = [
            $user1,
            User::firstOrCreate(
                ['email' => 'carlos.mendoza@unsch.edu.pe'],
                [
                    'name' => 'Carlos Mendoza',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'university_id' => '20220188',
                    'phone' => '+51 912 345 678',
                    'role' => 'user'
                ]
            ),
            User::firstOrCreate(
                ['email' => 'maria.quispe@unsch.edu.pe'],
                [
                    'name' => 'María Quispe',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'university_id' => '20200844',
                    'phone' => '+51 955 888 222',
                    'role' => 'user'
                ]
            ),
            User::firstOrCreate(
                ['email' => 'juan.huaman@unsch.edu.pe'],
                [
                    'name' => 'Juan Huamán',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'university_id' => '20230512',
                    'phone' => '+51 966 777 333',
                    'role' => 'user'
                ]
            ),
            User::firstOrCreate(
                ['email' => 'sofia.rojas@unsch.edu.pe'],
                [
                    'name' => 'Sofía Rojas',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'university_id' => '20210099',
                    'phone' => '+51 944 555 666',
                    'role' => 'user'
                ]
            )
        ];

        // Fetch products and inventories
        $products = Product::all();
        
        if ($products->isEmpty()) {
            return;
        }

        // Clean existing reservations and items to ensure clean seed
        Reservation::query()->delete();
        ReservationItem::query()->delete();

        // We will seed 15 reservations spread across the last 3 months
        $statuses = ['completed', 'confirmed', 'pending', 'cancelled'];
        
        // Let's create specific scenarios
        
        // Scenario 1: Completed reservations (last month/weeks)
        for ($i = 0; $i < 8; $i++) {
            $user = $users[array_rand($users)];
            $product = $products->random();
            $inventory = $product->inventories()->first() ?? Inventory::first();
            
            $daysAgoStart = rand(15, 60);
            $startDate = Carbon::now()->subDays($daysAgoStart);
            $endDate = (clone $startDate)->addDays(rand(2, 5));
            $days = $startDate->diffInDays($endDate) ?: 1;
            
            $total = $product->price_per_day * $days;

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'order_number' => 'RES-' . strtoupper(Str::random(8)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_amount' => $total,
                'status' => 'devuelta',
                'created_at' => $startDate->subHours(2),
                'updated_at' => $endDate
            ]);

            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'product_id' => $product->id,
                'inventory_id' => $inventory->id,
                'price_at_time' => $product->price_per_day,
                'start_date' => $reservation->start_date,
                'end_date' => $reservation->end_date,
                'subtotal' => $total
            ]);
        }

        // Scenario 2: Active rentals (currently in use)
        // start_date is 2 days ago, end_date is 3 days from now, status confirmed
        for ($i = 0; $i < 3; $i++) {
            $user = $users[array_rand($users)];
            $product = $products->random();
            $inventory = $product->inventories()->first() ?? Inventory::first();
            
            $startDate = Carbon::now()->subDays(rand(1, 3));
            $endDate = Carbon::now()->addDays(rand(2, 4));
            $days = $startDate->diffInDays($endDate) ?: 1;
            
            $total = $product->price_per_day * $days;

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'order_number' => 'RES-ACT-' . strtoupper(Str::random(6)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_amount' => $total,
                'status' => 'en_uso', // Confirmed implies active/approved
                'created_at' => $startDate->subDay()
            ]);

            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'product_id' => $product->id,
                'inventory_id' => $inventory->id,
                'price_at_time' => $product->price_per_day,
                'start_date' => $reservation->start_date,
                'end_date' => $reservation->end_date,
                'subtotal' => $total
            ]);
        }

        // Scenario 3: Overdue returns (start_date in past, end_date in past, status confirmed)
        for ($i = 0; $i < 2; $i++) {
            $user = $users[array_rand($users)];
            $product = $products->random();
            $inventory = $product->inventories()->first() ?? Inventory::first();
            
            $startDate = Carbon::now()->subDays(rand(12, 15));
            $endDate = Carbon::now()->subDays(rand(5, 7)); // Should have been returned
            $days = $startDate->diffInDays($endDate) ?: 1;
            
            $total = $product->price_per_day * $days;

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'order_number' => 'RES-OVD-' . strtoupper(Str::random(6)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_amount' => $total,
                'status' => 'entregada', // Still confirmed/in-use, hence overdue!
                'created_at' => $startDate->subDay()
            ]);

            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'product_id' => $product->id,
                'inventory_id' => $inventory->id,
                'price_at_time' => $product->price_per_day,
                'start_date' => $reservation->start_date,
                'end_date' => $reservation->end_date,
                'subtotal' => $total
            ]);
        }

        // Scenario 4: Pending future reservations
        for ($i = 0; $i < 3; $i++) {
            $user = $users[array_rand($users)];
            $product = $products->random();
            $inventory = $product->inventories()->first() ?? Inventory::first();
            
            $startDate = Carbon::now()->addDays(rand(2, 10));
            $endDate = (clone $startDate)->addDays(rand(2, 4));
            $days = $startDate->diffInDays($endDate) ?: 1;
            
            $total = $product->price_per_day * $days;

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'order_number' => 'RES-PEN-' . strtoupper(Str::random(6)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_amount' => $total,
                'status' => 'pendiente',
                'created_at' => Carbon::now()->subDays(rand(1, 2))
            ]);

            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'product_id' => $product->id,
                'inventory_id' => $inventory->id,
                'price_at_time' => $product->price_per_day,
                'start_date' => $reservation->start_date,
                'end_date' => $reservation->end_date,
                'subtotal' => $total
            ]);
        }

        // Scenario 5: Cancelled reservations
        for ($i = 0; $i < 2; $i++) {
            $user = $users[array_rand($users)];
            $product = $products->random();
            $inventory = $product->inventories()->first() ?? Inventory::first();
            
            $startDate = Carbon::now()->subDays(rand(5, 10));
            $endDate = (clone $startDate)->addDays(rand(2, 4));
            $days = $startDate->diffInDays($endDate) ?: 1;
            
            $total = $product->price_per_day * $days;

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'order_number' => 'RES-CAN-' . strtoupper(Str::random(6)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_amount' => $total,
                'status' => 'rechazada',
                'created_at' => Carbon::now()->subDays(rand(15, 20))
            ]);

            ReservationItem::create([
                'reservation_id' => $reservation->id,
                'product_id' => $product->id,
                'inventory_id' => $inventory->id,
                'price_at_time' => $product->price_per_day,
                'start_date' => $reservation->start_date,
                'end_date' => $reservation->end_date,
                'subtotal' => $total
            ]);
        }
    }
}
