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
        $products = Product::where('status', 'active')->with(['category', 'inventories'])->get();
        
        $categories = Category::withCount(['products' => function($query) {
            $query->where('status', 'active');
        }])->get();

        return Inertia::render('Catalogo', [
            'products' => $products,
            'categories' => $categories
        ]);
    }
}
