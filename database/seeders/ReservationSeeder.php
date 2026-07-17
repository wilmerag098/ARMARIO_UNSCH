<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\Promotion;
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

        // Clean existing reservations and items
        Reservation::query()->delete();
        ReservationItem::query()->delete();

        // Get promotion
        $promotion = Promotion::where('is_active', true)->first();

        // Separate main products and accessories
        $mainProducts = Product::whereHas('category', function($q) {
            $q->where('slug', '!=', 'accesorios');
        })->get();

        $accessories = Product::whereHas('category', function($q) {
            $q->where('slug', 'accesorios');
        })->get();

        if ($mainProducts->isEmpty()) {
            return;
        }

        // We will seed 15 reservations spread across the last 3 months
        for ($i = 0; $i < 15; $i++) {
            $user = $users[array_rand($users)];
            $product = $mainProducts->random();
            $inventory = $product->inventories()->first() ?? Inventory::first();
            
            // Random start dates in the last 45 days or future 10 days
            $daysOffset = rand(-45, 10);
            $startDate = Carbon::now()->addDays($daysOffset);
            $endDate = (clone $startDate)->addDays(rand(2, 5));
            $days = $startDate->diffInDays($endDate) + 1;
            
            $mainSubtotal = $product->price_per_day * $days;
            $accessoriesSubtotal = 0.00;
            $discountAmount = 0.00;
            $appliedPromoId = null;

            // Determine status based on dates
            if ($startDate->isFuture()) {
                $status = 'pendiente';
            } elseif ($endDate->isPast()) {
                $status = rand(0, 10) > 2 ? 'devuelta' : 'rechazada';
            } else {
                $status = rand(0, 10) > 3 ? 'en_uso' : 'entregada';
            }

            // Decide if this reservation includes accessories (60% chance)
            $addAccessory = (rand(0, 10) < 6) && !$accessories->isEmpty();
            $itemsToCreate = [
                [
                    'product' => $product,
                    'inventory' => $inventory,
                    'price' => $product->price_per_day,
                    'subtotal' => $mainSubtotal
                ]
            ];

            if ($addAccessory) {
                $accProduct = $accessories->random();
                $accInventory = $accProduct->inventories()->first() ?? Inventory::first();
                $accSubtotal = $accProduct->price_per_day * $days;
                
                // Check if promotion is active and main rental amount > min_amount
                $isPromoApplicable = $promotion && ($mainSubtotal > $promotion->min_amount);
                
                if ($isPromoApplicable) {
                    $appliedPromoId = $promotion->id;
                    $itemDiscount = $accSubtotal * ($promotion->discount_percentage / 100.00);
                    $discountAmount = $itemDiscount;
                    $accSubtotalAfterDiscount = $accSubtotal - $itemDiscount;
                } else {
                    $accSubtotalAfterDiscount = $accSubtotal;
                }

                $itemsToCreate[] = [
                    'product' => $accProduct,
                    'inventory' => $accInventory,
                    'price' => $accProduct->price_per_day,
                    'subtotal' => $accSubtotalAfterDiscount
                ];

                $accessoriesSubtotal = $accSubtotal;
            }

            $serviceFee = 15.00;
            $totalAmount = $mainSubtotal + $accessoriesSubtotal - $discountAmount + $serviceFee;

            $reservation = Reservation::create([
                'user_id' => $user->id,
                'order_number' => 'RES-' . strtoupper(Str::random(8)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'promotion_id' => $appliedPromoId,
                'status' => $status,
                'created_at' => $startDate->subHours(rand(2, 24)),
                'updated_at' => $endDate
            ]);

            foreach ($itemsToCreate as $item) {
                ReservationItem::create([
                    'reservation_id' => $reservation->id,
                    'product_id' => $item['product']->id,
                    'inventory_id' => $item['inventory']->id,
                    'price_at_time' => $item['price'],
                    'start_date' => $reservation->start_date,
                    'end_date' => $reservation->end_date,
                    'subtotal' => $item['subtotal']
                ]);
            }
        }
    }
}
