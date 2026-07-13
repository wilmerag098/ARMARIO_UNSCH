<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Vestidos de Gala',
                'slug' => 'vestidos-de-gala',
                'description' => 'Vestidos de noche y gala formales.',
            ],
            [
                'name' => 'Ternos / Trajes Formales',
                'slug' => 'ternos-trajes-formales',
                'description' => 'Ternos premium y sacos de vestir para ceremonias.',
            ],
            [
                'name' => 'Trajes de Presentación',
                'slug' => 'trajes-de-presentacion',
                'description' => 'Vestuarios especiales para exposiciones y ponencias.',
            ],
            [
                'name' => 'Ropa Semi-Formal',
                'slug' => 'ropa-semi-formal',
                'description' => 'Camisas, blusas y calzado semi-formal.',
            ],
            [
                'name' => 'Graduación',
                'slug' => 'graduacion',
                'description' => 'Togas, birretes y estolas académicas.',
            ],
            [
                'name' => 'Eventos Especiales',
                'slug' => 'eventos-especiales',
                'description' => 'Trajes temáticos o de alta gala para recepciones.',
            ],
            [
                'name' => 'Accesorios',
                'slug' => 'accesorios',
                'description' => 'Corbatas, lazos, correas y calzado formal.',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
