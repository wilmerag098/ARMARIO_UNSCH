<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class ProductController extends Controller
{
    public function show($slug)
    {
        $product = Product::with(['category', 'inventories'])->where('slug', $slug)->firstOrFail();

        return Inertia::render('Producto', [
            'product' => $product
        ]);
    }
}
