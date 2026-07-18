<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'favorite_product_ids' => $request->user()->favorites()->pluck('product_id')->toArray()
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'globalCategories' => function() {
                return \App\Models\Category::withCount(['products' => function($query) {
                    $query->where('status', 'active');
                }])->orderBy('name')->get()->map(function($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'products_count' => $cat->products_count
                    ];
                })->toArray();
            },
            'adminNotifications' => function() use ($request) {
                $user = $request->user();
                if (!$user || $user->role !== 'admin') {
                    return [];
                }

                $notifications = [];
                $id = 1;

                // 1. Overdue reservations
                $overdue = \App\Models\Reservation::with('user')
                    ->whereIn('status', ['en_uso', 'entregada'])
                    ->where('end_date', '<', \Carbon\Carbon::today())
                    ->take(3)
                    ->get();
                foreach ($overdue as $res) {
                    $notifications[] = [
                        'id' => $id++,
                        'title' => 'Reserva Atrasada',
                        'desc' => "El pedido #{$res->order_number} de " . ($res->user ? $res->user->name : 'un estudiante') . " está vencido.",
                        'time' => \Carbon\Carbon::parse($res->end_date)->diffForHumans(),
                        'read' => false,
                        'link' => '/admin/reservas'
                    ];
                }

                // 2. Low stock products (stock < 2)
                $lowStock = \App\Models\Product::whereHas('inventories', function ($q) {
                    $q->where('status', 'available');
                }, '<', 2)->take(3)->get();
                foreach ($lowStock as $prod) {
                    $notifications[] = [
                        'id' => $id++,
                        'title' => 'Stock Bajo',
                        'desc' => "Queda menos de 2 unidades de {$prod->name}.",
                        'time' => 'Ahora',
                        'read' => false,
                        'link' => '/admin/inventario'
                    ];
                }

                // 3. Recent payments (updated_at inside the last week)
                $recentPayments = \App\Models\Reservation::where('payment_status', 'pagado')
                    ->where('updated_at', '>=', \Carbon\Carbon::now()->subWeek())
                    ->orderBy('updated_at', 'desc')
                    ->take(3)
                    ->get();
                foreach ($recentPayments as $res) {
                    $notifications[] = [
                        'id' => $id++,
                        'title' => 'Pago Registrado',
                        'desc' => "Reserva #{$res->order_number} pagada correctamente (S/ " . number_format($res->total_amount, 2) . ").",
                        'time' => \Carbon\Carbon::parse($res->updated_at)->diffForHumans(),
                        'read' => true,
                        'link' => '/admin/pagos'
                    ];
                }

                // 4. New users (last 3 days)
                $newUsers = \App\Models\User::where('created_at', '>=', \Carbon\Carbon::now()->subDays(3))
                    ->where('id', '!=', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->take(3)
                    ->get();
                foreach ($newUsers as $u) {
                    $notifications[] = [
                        'id' => $id++,
                        'title' => 'Nuevo Estudiante',
                        'desc' => "{$u->name} se ha registrado en el sistema.",
                        'time' => \Carbon\Carbon::parse($u->created_at)->diffForHumans(),
                        'read' => true,
                        'link' => '/admin/usuarios'
                    ];
                }

                return $notifications;
            }
        ];
    }
}
