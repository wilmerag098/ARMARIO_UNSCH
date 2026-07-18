<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\UserDashboardController;
use Inertia\Inertia;

use App\Http\Controllers\AdminController;

Route::get('/', function () {
    $products = \App\Models\Product::with('inventories')->orderBy('created_at', 'desc')->take(3)->get();
    return Inertia::render('welcome', [
        'products' => $products
    ]);
})->name('home');
Route::get('/catalogo', [CatalogController::class, 'index'])->name('catalogo');
Route::get('/producto/{slug}', [ProductController::class, 'show'])->name('producto');
Route::post('/checkout/register', [CheckoutController::class, 'fastRegister'])->name('checkout.register');
Route::get('/checkout/{product:slug}', [CheckoutController::class, 'index'])->name('checkout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    
    Route::get('/perfil', [UserDashboardController::class, 'profile'])->name('perfil');
    
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/productos', [AdminController::class, 'products'])->name('admin.products');
    Route::post('/productos', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::put('/productos/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
    Route::delete('/productos/{product}', [AdminController::class, 'deleteProduct'])->name('admin.products.delete');
    Route::get('/inventario', [AdminController::class, 'inventory'])->name('admin.inventory');
    Route::get('/reservas', [AdminController::class, 'reservations'])->name('admin.reservations');
    Route::put('/reservas/{reservation}/status', [AdminController::class, 'updateReservationStatus'])->name('admin.reservations.update-status');
    Route::get('/usuarios', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/reportes', [AdminController::class, 'reports'])->name('admin.reports');
    Route::get('/configuracion', [AdminController::class, 'settings'])->name('admin.settings');
    Route::get('/perfil', function () {
        return Inertia::render('admin/Profile');
    })->name('admin.profile');
    Route::patch('/perfil', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
});

require __DIR__.'/settings.php';
