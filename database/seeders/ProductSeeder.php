<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Inventory;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categoryTogas = Category::where('slug', 'graduacion')->first();
        $categoryTernos = Category::where('slug', 'ternos-trajes-formales')->first();
        $categoryVestidos = Category::where('slug', 'vestidos-de-gala')->first();

        if (!$categoryTogas || !$categoryTernos || !$categoryVestidos) {
            return;
        }

        // Clean existing products and inventories to ensure clean seed
        Product::query()->delete();
        Inventory::query()->delete();

        // 1. Smoking Gala Slim Fit - Negro Clásico
        $product1 = Product::create([
            'category_id' => $categoryTernos->id,
            'name' => 'Smoking Gala Slim Fit - Negro Clásico',
            'slug' => 'smoking-gala-slim-fit-negro-clasico',
            'description' => 'Smoking premium entallado para galas formales y ceremonias académicas.',
            'price_per_day' => 45.00,
            'security_deposit' => 100.00,
            'image_url' => '/images/products/smoking_blue_check.png',
            'specifications' => [
                ['label' => 'Fit prenda superior', 'value' => 'Slim fit'],
                ['label' => 'Modelo', 'value' => 'VSSL BASIC ST'],
                ['label' => 'País de origen', 'value' => 'Perú (Diseño Local)'],
                ['label' => 'Material de vestuario', 'value' => 'Lana italiana / Poliéster premium'],
                ['label' => 'Cantidad de bolsillos', 'value' => '3 (2 laterales, 1 de pecho)']
            ],
        ]);
        
        Inventory::create(['product_id' => $product1->id, 'size' => 'S', 'sku' => 'SG-S-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product1->id, 'size' => 'M', 'sku' => 'SG-M-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product1->id, 'size' => 'L', 'sku' => 'SG-L-001', 'status' => 'maintenance']);
        Inventory::create(['product_id' => $product1->id, 'size' => 'XL', 'sku' => 'SG-XL-001', 'status' => 'available']);

        // 2. Vestido de Noche Largo - Azul Escarlata
        $product2 = Product::create([
            'category_id' => $categoryVestidos->id,
            'name' => 'Vestido de Noche Largo - Azul Escarlata',
            'slug' => 'vestido-de-noche-largo-azul-escarlata',
            'description' => 'Elegante vestido de noche largo con hombros descubiertos, ideal para graduaciones y eventos protocolares.',
            'price_per_day' => 60.00,
            'security_deposit' => 120.00,
            'image_url' => '/images/products/vestido_noche_blur.png',
            'specifications' => [
                ['label' => 'Fit prenda superior', 'value' => 'Corte entallado / A-Line'],
                ['label' => 'Modelo', 'value' => 'VGD-ELEGANT-26'],
                ['label' => 'País de origen', 'value' => 'Perú (Diseño Local)'],
                ['label' => 'Material de vestuario', 'value' => 'Seda de alta densidad / Gasa'],
                ['label' => 'Cantidad de bolsillos', 'value' => 'Sin bolsillos']
            ],
        ]);

        Inventory::create(['product_id' => $product2->id, 'size' => 'XS', 'sku' => 'VN-XS-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product2->id, 'size' => 'S', 'sku' => 'VN-S-001', 'status' => 'maintenance']);
        Inventory::create(['product_id' => $product2->id, 'size' => 'M', 'sku' => 'VN-M-001', 'status' => 'available']);

        // 3. Smoking Clásico Negro
        $product3 = Product::create([
            'category_id' => $categoryTernos->id,
            'name' => 'Smoking Clásico Negro',
            'slug' => 'smoking-clasico-negro',
            'description' => 'Smoking formal clásico en corte tradicional, perfecto para protocolo académico.',
            'price_per_day' => 80.00,
            'security_deposit' => 150.00,
            'image_url' => '/images/products/vestido_noche_purple.png',
            'specifications' => [
                ['label' => 'Fit prenda superior', 'value' => 'Regular fit'],
                ['label' => 'Modelo', 'value' => 'VSSL CLASSIC'],
                ['label' => 'País de origen', 'value' => 'Perú (Diseño Local)'],
                ['label' => 'Material de vestuario', 'value' => 'Casimir inglés'],
                ['label' => 'Cantidad de bolsillos', 'value' => '3 (2 laterales, 1 de pecho)']
            ],
        ]);

        Inventory::create(['product_id' => $product3->id, 'size' => 'M', 'sku' => 'SC-M-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product3->id, 'size' => 'L', 'sku' => 'SC-L-001', 'status' => 'maintenance']);
        Inventory::create(['product_id' => $product3->id, 'size' => 'XL', 'sku' => 'SC-XL-001', 'status' => 'available']);

        // 4. Toga de Grado - Maestría (Extra)
        $product4 = Product::create([
            'category_id' => $categoryTogas->id,
            'name' => 'Toga de Grado - Maestría',
            'slug' => 'toga-grado-maestria',
            'description' => 'Toga oficial para graduación de Maestría UNSCH con estola y birrete satinados.',
            'price_per_day' => 50.00,
            'security_deposit' => 80.00,
            'image_url' => 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop',
            'specifications' => [
                ['label' => 'Fit prenda superior', 'value' => 'Oversize / Toga'],
                ['label' => 'Modelo', 'value' => 'TOGA-UNSCH-MAESTRIA'],
                ['label' => 'País de origen', 'value' => 'Perú'],
                ['label' => 'Material de vestuario', 'value' => 'Satén premium'],
                ['label' => 'Cantidad de bolsillos', 'value' => 'Sin bolsillos']
            ],
        ]);

        Inventory::create(['product_id' => $product4->id, 'size' => 'S', 'sku' => 'TG-S-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product4->id, 'size' => 'M', 'sku' => 'TG-M-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product4->id, 'size' => 'L', 'sku' => 'TG-L-001', 'status' => 'available']);
        Inventory::create(['product_id' => $product4->id, 'size' => 'XL', 'sku' => 'TG-XL-001', 'status' => 'maintenance']);
    }
}
