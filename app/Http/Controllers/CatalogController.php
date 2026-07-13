<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'inventories'])->get();
        $categories = Category::all();

        return Inertia::render('Catalogo', [
            'products' => $products,
            'categories' => $categories
        ]);
    }
}
