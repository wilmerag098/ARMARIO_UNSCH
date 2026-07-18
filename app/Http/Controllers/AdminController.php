<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Reservation;
use App\Models\Category;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        $today = Carbon::today();
        $oneWeekAgo = Carbon::now()->subWeek();
        $twoWeeksAgo = Carbon::now()->subWeeks(2);

        // 1. Metrics calculation
        $totalReservations = Reservation::count();
        $totalEarnings = Reservation::where('status', '!=', 'rechazada')->sum('total_amount');
        $totalProducts = Product::count();
        $totalUsers = User::count();

        // Calculate comparison trends (vs previous week)
        $resThisWeek = Reservation::where('created_at', '>=', $oneWeekAgo)->count();
        $resLastWeek = Reservation::whereBetween('created_at', [$twoWeeksAgo, $oneWeekAgo])->count();
        $resTrend = $resLastWeek > 0 ? round((($resThisWeek - $resLastWeek) / $resLastWeek) * 100, 1) : 12.4;

        $earnThisWeek = Reservation::where('status', '!=', 'rechazada')->where('created_at', '>=', $oneWeekAgo)->sum('total_amount');
        $earnLastWeek = Reservation::where('status', '!=', 'rechazada')->whereBetween('created_at', [$twoWeeksAgo, $oneWeekAgo])->sum('total_amount');
        $earnTrend = $earnLastWeek > 0 ? round((($earnThisWeek - $earnLastWeek) / $earnLastWeek) * 100, 1) : 18.6;

        $usersThisWeek = User::where('created_at', '>=', $oneWeekAgo)->count();
        $usersLastWeek = User::whereBetween('created_at', [$twoWeeksAgo, $oneWeekAgo])->count();
        $usersTrend = $usersLastWeek > 0 ? round((($usersThisWeek - $usersLastWeek) / $usersLastWeek) * 100, 1) : 20.0;

        // 2. Recent Reservations
        $recentReservations = Reservation::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 3. Top rented products
        $topProducts = Product::select('products.id', 'products.name', 'products.image_url')
            ->selectRaw('COUNT(reservation_items.id) as rentals_count')
            ->leftJoin('reservation_items', 'products.id', '=', 'reservation_items.product_id')
            ->groupBy('products.id', 'products.name', 'products.image_url')
            ->orderBy('rentals_count', 'desc')
            ->take(5)
            ->get();

        // 4. Reservations by status (for doughnut chart)
        $statusCounts = Reservation::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();

        $statuses = ['pendiente', 'confirmada', 'preparando', 'entregada', 'en_uso', 'devuelta', 'rechazada'];
        $reservationsByStatus = [];
        foreach ($statuses as $st) {
            $reservationsByStatus[$st] = $statusCounts[$st] ?? 0;
        }

        // 5. Weekly earnings for main line chart (last 7 days)
        $dailyEarnings = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $sum = Reservation::whereDate('created_at', $date->toDateString())
                ->where('status', '!=', 'rechazada')
                ->sum('total_amount');
            $dailyEarnings[] = [
                'name' => $date->translatedFormat('d M'),
                'ingresos' => (float)$sum
            ];
        }

        // 6. Dynamic Alerts & Notifications
        $lowStockCount = Product::whereHas('inventories', function ($q) {
            $q->where('status', 'available');
        }, '<', 2)->count();

        $upcomingReturns = Reservation::where('end_date', '<=', Carbon::tomorrow())
            ->whereIn('status', ['confirmada', 'preparando', 'entregada', 'en_uso'])
            ->count();

        $recentPayment = Reservation::where('payment_status', 'pagado')
            ->orderBy('updated_at', 'desc')
            ->first();

        $alerts = [
            [
                'type' => 'warning',
                'title' => "$lowStockCount productos con stock bajo",
                'description' => 'Verificar inventario de percheros.',
                'time' => 'Ahora mismo'
            ],
            [
                'type' => 'info',
                'title' => "$upcomingReturns alquileres próximos a vencer",
                'description' => 'Revisar calendario de devoluciones.',
                'time' => 'Hoy/Mañana'
            ],
        ];

        if ($recentPayment) {
            $alerts[] = [
                'type' => 'success',
                'title' => "Pago recibido - Pedido #" . $recentPayment->order_number,
                'description' => "S/ " . number_format($recentPayment->total_amount, 2),
                'time' => Carbon::parse($recentPayment->updated_at)->diffForHumans()
            ];
        }

        $latestUser = User::where('id', '!=', auth()->id())->orderBy('created_at', 'desc')->first();
        if ($latestUser) {
            $alerts[] = [
                'type' => 'user',
                'title' => "Nuevo estudiante: {$latestUser->name}",
                'description' => "Se ha registrado el correo {$latestUser->email}.",
                'time' => Carbon::parse($latestUser->created_at)->diffForHumans()
            ];
        }

        return Inertia::render('admin/Dashboard', [
            'metrics' => [
                'totalReservations' => $totalReservations,
                'totalEarnings' => $totalEarnings,
                'totalProducts' => $totalProducts,
                'totalUsers' => $totalUsers,
                'trends' => [
                    'reservations' => $resTrend,
                    'earnings' => $earnTrend,
                    'users' => $usersTrend
                ]
            ],
            'recentReservations' => $recentReservations,
            'topProducts' => $topProducts,
            'reservationsByStatus' => $reservationsByStatus,
            'dailyEarnings' => $dailyEarnings,
            'alerts' => $alerts
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
        if ($request->hasFile('images') && is_array($request->file('images'))) {
            $filteredFiles = array_filter($request->file('images'), function ($file) {
                return $file !== null;
            });
            $request->files->set('images', $filteredFiles);
            $request->merge(['images' => $filteredFiles]);
        } else {
            $request->offsetUnset('images');
            if ($request->files->has('images')) {
                $request->files->remove('images');
            }
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
            'colors' => 'nullable|array',
            'colors.*' => 'nullable|string|max:50',
            'quantities' => 'required|array',
            'quantities.*' => 'required|integer|min:1',
            'status' => 'required|string|in:active,inactive',
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
            'colors' => $request->colors ?? [],
            'status' => $request->status,
        ]);

        foreach ($request->sizes as $size) {
            $qty = intval($request->quantities[$size] ?? 1);
            for ($i = 0; $i < $qty; $i++) {
                $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                while (Inventory::where('sku', $sku)->exists()) {
                    $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                }

                Inventory::create([
                    'product_id' => $product->id,
                    'size' => $size,
                    'sku' => $sku,
                    'status' => 'available',
                ]);
            }
        }

        return redirect()->route('admin.products')->with('success', 'Prenda registrada correctamente.');
    }

    public function updateProduct(Request $request, Product $product)
    {
        if ($request->hasFile('images') && is_array($request->file('images'))) {
            $filteredFiles = array_filter($request->file('images'), function ($file) {
                return $file !== null;
            });
            $request->files->set('images', $filteredFiles);
            $request->merge(['images' => $filteredFiles]);
        } else {
            $request->offsetUnset('images');
            if ($request->files->has('images')) {
                $request->files->remove('images');
            }
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
            'colors' => 'nullable|array',
            'colors.*' => 'nullable|string|max:50',
            'quantities' => 'required|array',
            'quantities.*' => 'required|integer|min:1',
            'status' => 'required|string|in:active,inactive',
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
            'colors' => $request->colors ?? [],
            'status' => $request->status,
        ]);

        $existingSizes = $product->inventories()->pluck('size')->toArray();
        $newSizes = $request->sizes;

        // 1. Remove inventories for sizes that are completely deselected
        $removedSizes = array_diff($existingSizes, $newSizes);
        if (count($removedSizes) > 0) {
            $product->inventories()->whereIn('size', $removedSizes)->delete();
        }

        // 2. Adjust inventories for sizes that are selected
        foreach ($newSizes as $size) {
            $targetQty = intval($request->quantities[$size] ?? 1);
            $currentQty = $product->inventories()->where('size', $size)->count();

            if ($currentQty < $targetQty) {
                $needed = $targetQty - $currentQty;
                for ($i = 0; $i < $needed; $i++) {
                    $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                    while (Inventory::where('sku', $sku)->exists()) {
                        $sku = strtoupper(substr($slug, 0, 3)) . '-' . $size . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                    }
                    Inventory::create([
                        'product_id' => $product->id,
                        'size' => $size,
                        'sku' => $sku,
                        'status' => 'available',
                    ]);
                }
            } elseif ($currentQty > $targetQty) {
                $toDeleteCount = $currentQty - $targetQty;
                $inventoriesToDelete = $product->inventories()
                    ->where('size', $size)
                    ->where('status', 'available')
                    ->orderBy('created_at', 'desc')
                    ->take($toDeleteCount)
                    ->get();
                
                foreach ($inventoriesToDelete as $inv) {
                    $inv->delete();
                }
            }
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
        $inventories = Inventory::with(['product.category'])
            ->orderBy('sku', 'asc')
            ->get();

        $products = Product::orderBy('name', 'asc')->get();

        return Inertia::render('admin/Inventory', [
            'inventories' => $inventories,
            'products' => $products
        ]);
    }

    public function reservations()
    {
        $reservations = Reservation::with(['user', 'items.product', 'items.inventory'])
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

        // Cargar los items de la reserva con sus inventarios asociados para sincronizar el estado físico
        $reservation->load('items.inventory');

        foreach ($reservation->items as $item) {
            if ($item->inventory) {
                if (in_array($request->status, ['en_uso', 'entregada'])) {
                    $item->inventory->update(['status' => 'rented']);
                } elseif ($request->status === 'devuelta') {
                    // Pasa automáticamente a lavandería / mantenimiento
                    $item->inventory->update(['status' => 'maintenance']);
                } elseif (in_array($request->status, ['rechazada', 'pendiente'])) {
                    // Si se cancela, rechaza o vuelve a pendiente, vuelve a estar disponible
                    $item->inventory->update(['status' => 'available']);
                }
            }
        }

        return redirect()->route('admin.reservations')->with('success', 'Estado de la reserva y disponibilidad física actualizados correctamente.');
    }

    public function users()
    {
        $users = User::withCount(['reservations as active_reservations_count' => function ($query) {
            $query->whereNotIn('status', ['devuelta', 'rechazada']);
        }])->orderBy('name', 'asc')->get();

        return Inertia::render('admin/Users', [
            'users' => $users
        ]);
    }

    public function reports()
    {
        $today = Carbon::today();
        $totalProducts = Product::count();

        // 1. Distribución de categorías real con porcentajes
        $categoryDistribution = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('count(products.id) as total'))
            ->groupBy('categories.name')
            ->get()
            ->map(function ($cat) use ($totalProducts) {
                $cat->percentage = $totalProducts > 0 ? round(($cat->total / $totalProducts) * 100, 1) : 0;
                return $cat;
            });

        // 2. Estado de ejemplares de inventario físico
        $inventoryStatus = DB::table('inventories')
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        // 3. Tallas más populares solicitadas en alquileres
        $popularSizes = DB::table('reservation_items')
            ->join('inventories', 'reservation_items.inventory_id', '=', 'inventories.id')
            ->select('inventories.size', DB::raw('count(*) as total'))
            ->groupBy('inventories.size')
            ->orderBy('total', 'desc')
            ->get();

        // 4. Ingresos mensuales (alquiler neto vs garantías cobradas/retenidas)
        $monthlyEarnings = Reservation::where('status', '!=', 'rechazada')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("SUM(total_amount - guarantee_amount) as rental_income"),
                DB::raw("SUM(CASE WHEN guarantee_status = 'retenida' THEN guarantee_amount ELSE 0 END) as retained_guarantees"),
                DB::raw("SUM(total_amount) as total_collected")
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // 5. Distribución de Métodos de Pago
        $paymentMethods = Reservation::where('payment_status', 'pagado')
            ->select('payment_method', DB::raw('SUM(total_amount) as total'), DB::raw('count(*) as count'))
            ->groupBy('payment_method')
            ->get();

        // 6. Ranking del Top 5 de estudiantes con más reservas exitosas
        $topStudents = DB::table('reservations')
            ->join('users', 'reservations.user_id', '=', 'users.id')
            ->where('reservations.status', '!=', 'rechazada')
            ->select(
                'users.name',
                'users.email',
                DB::raw('COUNT(reservations.id) as total_rentals'),
                DB::raw('SUM(reservations.total_amount) as total_spent')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_rentals', 'desc')
            ->take(5)
            ->get();

        // 7. Tasa de puntualidad en devoluciones
        $totalFinished = Reservation::whereIn('status', ['devuelta', 'en_uso', 'entregada'])->count();
        $overdueCount = Reservation::whereIn('status', ['en_uso', 'entregada'])
            ->where('end_date', '<', $today)
            ->count();
        $devueltasCount = Reservation::where('status', 'devuelta')->count();

        $punctuality = [
            'total' => $totalFinished,
            'on_time' => $devueltasCount,
            'overdue' => $overdueCount,
            'on_time_percentage' => $totalFinished > 0 ? round(($devueltasCount / $totalFinished) * 100, 1) : 100
        ];

        return Inertia::render('admin/Reports', [
            'categoryDistribution' => $categoryDistribution,
            'inventoryStatus' => $inventoryStatus,
            'popularSizes' => $popularSizes,
            'monthlyEarnings' => $monthlyEarnings,
            'paymentMethods' => $paymentMethods,
            'topStudents' => $topStudents,
            'punctuality' => $punctuality
        ]);
    }

    public function settings()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        $defaultSettings = [
            'max_rental_days' => '5',
            'overdue_penalty' => '10',
            'max_items_per_student' => '2',
            'auto_reminders' => '1',
            'reminder_hours_before' => '24',
            'default_guarantee' => '50',
            'terms_conditions' => 'El estudiante se compromete a devolver la prenda en las mismas condiciones de higiene y conservación en las que fue entregada. Cualquier daño, rotura, mancha irreparable o pérdida total de la prenda facultará al Armario UNSCH a retener total o parcialmente el depósito de garantía entregado.'
        ];

        $mergedSettings = array_merge($defaultSettings, $settings);

        // Convert auto_reminders to boolean for React checkbox
        $mergedSettings['auto_reminders'] = filter_var($mergedSettings['auto_reminders'], FILTER_VALIDATE_BOOLEAN);

        return Inertia::render('admin/Settings', [
            'settings' => $mergedSettings
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'max_rental_days' => 'required|integer|min:1',
            'overdue_penalty' => 'required|numeric|min:0',
            'max_items_per_student' => 'required|integer|min:1',
            'auto_reminders' => 'required|boolean',
            'reminder_hours_before' => 'required|integer|min:1',
            'default_guarantee' => 'required|numeric|min:0',
            'terms_conditions' => 'required|string'
        ]);

        foreach ($validated as $key => $value) {
            // Convert boolean back to string '1' / '0' for text column
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Configuraciones del sistema actualizadas correctamente.');
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'names' => 'required|string|max:255',
            'lastNames' => 'required|string|max:255',
            'dni' => 'required|string|max:20',
            'roleDetail' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'avatar' => 'nullable|image|max:2048',
            'language' => 'required|string|in:Español,Inglés',
            'panelTheme' => 'required|string|in:Claro,Oscuro',
            'timezone' => 'required|string',
            'dateFormat' => 'required|string',
            'notifyReservations' => 'required|boolean',
            'notifyReturns' => 'required|boolean',
            'notifySystem' => 'required|boolean',
        ]);

        $languageMap = [
            'Español' => 'es',
            'Inglés' => 'en',
        ];
        $themeMap = [
            'Claro' => 'light',
            'Oscuro' => 'dark',
        ];
        $timezoneMap = [
            '(GMT-05:00) Lima' => 'America/Lima',
            '(GMT-06:00) México' => 'America/Mexico_City',
            '(GMT+00:00) UTC' => 'UTC',
        ];

        $lang = $languageMap[$request->language] ?? 'es';
        $theme = $themeMap[$request->panelTheme] ?? 'light';
        $timezone = $timezoneMap[$request->timezone] ?? 'America/Lima';

        $userData = [
            'name' => $request->names,
            'last_name' => $request->lastNames,
            'dni' => $request->dni,
            'position' => $request->roleDetail,
            'email' => $request->email,
            'address' => $request->address,
            'phone' => $request->phone,
            'language' => $lang,
            'panel_theme' => $theme,
            'timezone' => $timezone,
            'date_format' => $request->dateFormat,
            'notify_reservations' => $request->notifyReservations,
            'notify_returns' => $request->notifyReturns,
            'notify_system' => $request->notifySystem,
        ];

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            if ($file->isValid()) {
                $filename = time() . '_avatar_' . $user->id . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/avatars'), $filename);
                
                // Optional: Delete old avatar file if it exists
                if ($user->profile_photo_path && file_exists(public_path($user->profile_photo_path))) {
                    @unlink(public_path($user->profile_photo_path));
                }

                $userData['profile_photo_path'] = '/images/avatars/' . $filename;
            }
        }

        $user->update($userData);

        return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
    }

    public function storeAdmin(Request $request)
    {
        $validated = $request->validate([
            'names' => 'required|string|max:255',
            'lastNames' => 'required|string|max:255',
            'dni' => 'required|string|max:20|unique:users,dni',
            'roleDetail' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'avatar' => 'nullable|image|max:2048',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $userData = [
            'name' => $request->names,
            'last_name' => $request->lastNames,
            'dni' => $request->dni,
            'position' => $request->roleDetail ?? 'Administrador',
            'email' => $request->email,
            'address' => $request->address,
            'phone' => $request->phone,
            'password' => bcrypt($request->password),
            'role' => 'admin',
            'status' => 'active',
            'type' => 'personal',
        ];

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            if ($file->isValid()) {
                $filename = time() . '_avatar_admin_' . Str::random(5) . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/avatars'), $filename);
                $userData['profile_photo_path'] = '/images/avatars/' . $filename;
            }
        }

        User::create($userData);

        return redirect()->back()->with('success', 'Administrador creado correctamente.');
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'names' => 'required|string|max:255',
            'lastNames' => 'required|string|max:255',
            'dni' => 'required|string|max:20|unique:users,dni,' . $user->id,
            'university_id' => 'nullable|string|max:50|unique:users,university_id,' . $user->id,
            'roleDetail' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'avatar' => 'nullable|image|max:2048',
            'role' => 'required|string|in:admin,user',
            'status' => 'required|string|in:active,inactive,suspended',
            'type' => 'required|string|in:estudiante,docente,personal',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $userData = [
            'name' => $request->names,
            'last_name' => $request->lastNames,
            'dni' => $request->dni,
            'university_id' => $request->university_id,
            'position' => $request->roleDetail,
            'email' => $request->email,
            'address' => $request->address,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $request->status,
            'type' => $request->type,
        ];

        if ($request->filled('password')) {
            $userData['password'] = bcrypt($request->password);
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            if ($file->isValid()) {
                $filename = time() . '_avatar_user_' . $user->id . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/avatars'), $filename);
                
                if ($user->profile_photo_path && file_exists(public_path($user->profile_photo_path))) {
                    @unlink(public_path($user->profile_photo_path));
                }

                $userData['profile_photo_path'] = '/images/avatars/' . $filename;
            }
        }

        $user->update($userData);

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }

    public function updateUserStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|string|in:active,inactive,suspended'
        ]);

        $user->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Estado del usuario actualizado correctamente.');
    }

    public function resetUserPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user->update(['password' => bcrypt($request->password)]);

        return redirect()->back()->with('success', 'Contraseña del usuario restablecida correctamente.');
    }

    public function deleteUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        if ($user->profile_photo_path && file_exists(public_path($user->profile_photo_path))) {
            @unlink(public_path($user->profile_photo_path));
        }

        $user->delete();

        return redirect()->back()->with('success', 'Usuario eliminado correctamente.');
    }

    public function storeInventory(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size' => 'required|string|max:10',
            'sku' => 'required|string|max:50|unique:inventories,sku',
            'status' => 'required|string|in:available,maintenance,rented,damaged',
        ]);

        Inventory::create($validated);

        return redirect()->back()->with('success', 'Ejemplar de inventario agregado correctamente.');
    }

    public function updateInventory(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size' => 'required|string|max:10',
            'sku' => 'required|string|max:50|unique:inventories,sku,' . $inventory->id,
            'status' => 'required|string|in:available,maintenance,rented,damaged',
        ]);

        $inventory->update($validated);

        return redirect()->back()->with('success', 'Ejemplar de inventario actualizado correctamente.');
    }

    public function updateInventoryStatus(Request $request, Inventory $inventory)
    {
        $request->validate([
            'status' => 'required|string|in:available,maintenance,rented,damaged'
        ]);

        $inventory->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Estado de la prenda física actualizado correctamente.');
    }

    public function deleteInventory(Inventory $inventory)
    {
        $inventory->delete();

        return redirect()->back()->with('success', 'Ejemplar de inventario eliminado correctamente.');
    }

    public function payments()
    {
        $reservations = Reservation::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Autocalcular garantías de registros preexistentes si es necesario
        foreach ($reservations as $res) {
            if ($res->guarantee_amount == 0.00 && !in_array($res->status, ['pendiente', 'rechazada'])) {
                $calcGuarantee = 0;
                if ($res->items) {
                    foreach ($res->items as $item) {
                        if ($item->product) {
                            $calcGuarantee += floatval($item->product->security_deposit);
                        }
                    }
                }
                if ($calcGuarantee > 0) {
                    $res->update([
                        'guarantee_amount' => $calcGuarantee,
                        'payment_status' => in_array($res->status, ['entregada', 'en_uso', 'devuelta']) ? 'pagado' : 'pendiente',
                        'guarantee_status' => $res->status === 'devuelta' ? 'devuelta' : 'pendiente'
                    ]);
                }
            }
        }

        return Inertia::render('admin/Payments', [
            'reservations' => $reservations
        ]);
    }

    public function registerPayment(Request $request, Reservation $reservation)
    {
        $request->validate([
            'payment_method' => 'required|string|in:yape,plin,efectivo,transferencia',
            'guarantee_amount' => 'required|numeric|min:0'
        ]);

        $reservation->update([
            'payment_status' => 'pagado',
            'payment_method' => $request->payment_method,
            'guarantee_amount' => $request->guarantee_amount,
            'guarantee_status' => 'pendiente'
        ]);

        return redirect()->back()->with('success', 'Pago registrado y depósito de garantía establecido con éxito.');
    }

    public function refundGuarantee(Request $request, Reservation $reservation)
    {
        $request->validate([
            'guarantee_status' => 'required|string|in:devuelta,retenida'
        ]);

        $reservation->update([
            'guarantee_status' => $request->guarantee_status
        ]);

        $msg = $request->guarantee_status === 'devuelta' 
            ? 'Garantía reembolsada al estudiante con éxito.' 
            : 'Garantía retenida/penalizada por daños en la prenda.';

        return redirect()->back()->with('success', $msg);
    }
}

