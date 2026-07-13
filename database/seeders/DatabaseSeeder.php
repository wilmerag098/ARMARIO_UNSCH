<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::factory()->create([
            'name' => 'Ana García',
            'email' => 'ana.garcia@unsch.edu.pe',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'university_id' => '20210459',
            'phone' => '+51 987 654 321',
            'role' => 'user'
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Administrador de Armario',
            'email' => 'admin@unsch.edu.pe',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'university_id' => '00000000',
            'phone' => '+51 999 999 999',
            'role' => 'admin'
        ]);

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            ReservationSeeder::class,
        ]);
    }
}
