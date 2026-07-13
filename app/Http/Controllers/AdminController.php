<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Reservation;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        $today = Carbon::today();

        // 1. Metrics calculation
        $totalReservations = Reservation::count();
        $totalEarnings = Reservation::where('status', '!=', 'rechazada')->sum('total_amount');
        
        // Overdue returns: end_date in the past, and status is confirmada, preparando, entregada or en_uso
        $overdueReturns = Reservation::where('end_date', '<', $today)
            ->whereIn('status', ['confirmada', 'preparando', 'entregada', 'en_uso'])
            ->count();
            
        // Active rentals: status is confirmada, preparando, entregada or en_uso
        $activeRentals = Reservation::whereIn('status', ['confirmada', 'preparando', 'entregada', 'en_uso'])->count();

        // 2. Recent Reservations
        $recentReservations = Reservation::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 3. Reservations over time (last 6 months) for chart
        $reservationsChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = Reservation::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $reservationsChart[] = [
                'name' => $month->translatedFormat('M'),
                'reservas' => $count
            ];
        }

        // 4. Income growth chart data (last 4 quarters or 6 months)
        $earningsChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $sum = Reservation::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount');
            $earningsChart[] = [
                'name' => $month->translatedFormat('M'),
                'ingresos' => (float)$sum
            ];
        }

        return Inertia::render('admin/Dashboard', [
            'metrics' => [
                'totalReservations' => $totalReservations,
                'totalEarnings' => $totalEarnings,
                'overdueReturns' => $overdueReturns,
                'activeRentals' => $activeRentals,
            ],
            'recentReservations' => $recentReservations,
            'reservationsChart' => $reservationsChart,
            'earningsChart' => $earningsChart
        ]);
    }

    public function products()
    {
        $products = Product::with(['category', 'inventories'])
            ->withCount('inventories')
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = Category::orderBy('name', 'asc')->get();

        return Inertia::render('admin/Products', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    public function storeProduct(Request $request)
    {
        if ($request->has('images') && is_array($request->images)) {
            $request->merge([
                'images' => array_filter($request->images, function ($file) {
                    return $file !== null;
                })
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price_per_day' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'sizes' => 'required|array|min:1',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|max:5120',
            'primary_image_index' => 'required|integer|min:0|max:4',
        ]);

        $imageUrls = [];
        $primaryImageUrl = 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800';

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . $index . '_' . Str::slug($request->name) . '.' . $file->getClientOriginalExtension();
                    $file->move(public_path('images/products'), $filename);
                    $path = '/images/products/' . $filename;
                    $imageUrls[$index] = $path;
                }
            }
        }

        $primaryIndex = intval($request->input('primary_image_index', 0));
        if (isset($imageUrls[$primaryIndex])) {
            $primaryImageUrl = $imageUrls[$primaryIndex];
        } elseif (count($imageUrls) > 0) {
            $primaryImageUrl = reset($imageUrls);
        }

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $count = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $specifications = [
            ['label' => 'Modelo', 'value' => 'Nuevo Ingreso'],
            ['label' => 'País de origen', 'value' => 'Perú'],
        ];

        $securityDeposit = floatval($request->price_per_day) * 0.20;

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description ?? '',
            'price_per_day' => $request->price_per_day,
            'security_deposit' => $securityDeposit,
            'image_url' => $primaryImageUrl,
            'images' => array_values($imageUrls),
            'specifications' => $specifications,
        ]);

        foreach ($request->sizes as $size) {
            $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            while (Inventory::where('sku', $sku)->exists()) {
                $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            }

            Inventory::create([
                'product_id' => $product->id,
                'size' => $size,
                'sku' => $sku,
                'status' => 'available',
            ]);
        }

        return redirect()->route('admin.products')->with('success', 'Prenda registrada correctamente.');
    }

    public function updateProduct(Request $request, Product $product)
    {
        if ($request->has('images') && is_array($request->images)) {
            $request->merge([
                'images' => array_filter($request->images, function ($file) {
                    return $file !== null;
                })
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price_per_day' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'sizes' => 'required|array|min:1',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:5120',
            'existing_images' => 'nullable|array',
            'primary_image_index' => 'required|integer|min:0|max:4',
        ]);

        $finalImageUrls = [null, null, null, null, null];

        if ($request->has('existing_images')) {
            foreach ($request->existing_images as $index => $url) {
                if ($url) {
                    $finalImageUrls[$index] = $url;
                }
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . $index . '_' . Str::slug($request->name) . '.' . $file->getClientOriginalExtension();
                    $file->move(public_path('images/products'), $filename);
                    $path = '/images/products/' . $filename;
                    $finalImageUrls[$index] = $path;
                }
            }
        }

        $imageUrls = array_values(array_filter($finalImageUrls));

        $primaryIndex = intval($request->input('primary_image_index', 0));
        $primaryImageUrl = 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800';
        if (isset($finalImageUrls[$primaryIndex]) && $finalImageUrls[$primaryIndex] !== null) {
            $primaryImageUrl = $finalImageUrls[$primaryIndex];
        } elseif (count($imageUrls) > 0) {
            $primaryImageUrl = $imageUrls[0];
        }

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $count = 1;
        while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $securityDeposit = floatval($request->price_per_day) * 0.20;

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description ?? '',
            'price_per_day' => $request->price_per_day,
            'security_deposit' => $securityDeposit,
            'image_url' => $primaryImageUrl,
            'images' => $imageUrls,
        ]);

        $existingSizes = $product->inventories()->pluck('size')->toArray();
        $newSizes = $request->sizes;

        foreach (array_diff($newSizes, $existingSizes) as $size) {
            $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            while (Inventory::where('sku', $sku)->exists()) {
                $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            }

            Inventory::create([
                'product_id' => $product->id,
                'size' => $size,
                'sku' => $sku,
                'status' => 'available',
            ]);
        }

        $removedSizes = array_diff($existingSizes, $newSizes);
        if (count($removedSizes) > 0) {
            $product->inventories()->whereIn('size', $removedSizes)->delete();
        }

        return redirect()->route('admin.products')->with('success', 'Prenda actualizada correctamente.');
    }

    public function deleteProduct(Product $product)
    {
        $product->delete();
        return redirect()->route('admin.products')->with('success', 'Prenda eliminada correctamente.');
    }

    public function inventory()
    {
        $inventories = Inventory::with('product')
            ->orderBy('sku', 'asc')
            ->get();

        return Inertia::render('admin/Inventory', [
            'inventories' => $inventories
        ]);
    }

    public function reservations()
    {
        $reservations = Reservation::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/Reservations', [
            'reservations' => $reservations
        ]);
    }

    public function updateReservationStatus(Request $request, Reservation $reservation)
    {
        $request->validate([
            'status' => 'required|string|in:pendiente,confirmada,preparando,entregada,en_uso,devuelta,rechazada'
        ]);

        $reservation->update([
            'status' => $request->status
        ]);

        return redirect()->route('admin.reservations')->with('success', 'Estado de la reserva actualizado correctamente.');
    }

    public function users()
    {
        $users = User::orderBy('name', 'asc')->get();

        return Inertia::render('admin/Users', [
            'users' => $users
        ]);
    }

    public function reports()
    {
        // Simple aggregate report data
        $categoryDistribution = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('count(products.id) as total'))
            ->groupBy('categories.name')
            ->get();

        return Inertia::render('admin/Reports', [
            'categoryDistribution' => $categoryDistribution
        ]);
    }

    public function settings()
    {
        return Inertia::render('admin/Settings');
    }
}
