<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class ProductController extends Controller
{
    public function show($slug)
    {
        $product = Product::where('status', 'active')->with(['category', 'inventories'])->where('slug', $slug)->firstOrFail();

        $relatedProducts = Product::where('status', 'active')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->with(['category', 'inventories'])
            ->get();

        return Inertia::render('Producto', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }
}
