<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Promotion::updateOrCreate(
            ['name' => '15% Descuento en Accesorios'],
            [
                'description' => 'Por rentas mayores a S/ 100.00 obtén un 15% de descuento en Accesorios',
                'min_amount' => 100.00,
                'discount_percentage' => 15.00,
                'is_active' => true,
                'start_date' => null,
                'end_date' => null,
            ]
        );
    }
}
