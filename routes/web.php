<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\UserDashboardController;
use Inertia\Inertia;

use App\Http\Controllers\AdminController;

Route::get('/', function () {
    $products = \App\Models\Product::with('inventories')->orderBy('created_at', 'desc')->take(6)->get();
    return Inertia::render('welcome', [
        'products' => $products
    ]);
})->name('home');
Route::get('/catalogo', [CatalogController::class, 'index'])->name('catalogo');

Route::get('/como-funciona', function () {
    return Inertia::render('ComoFunciona');
})->name('como-funciona');

Route::get('/nosotros', function () {
    return Inertia::render('Nosotros');
})->name('nosotros');

Route::get('/contacto', function () {
    return Inertia::render('Contacto');
})->name('contacto');

Route::get('/producto/{slug}', [ProductController::class, 'show'])->name('producto');
Route::post('/checkout/register', [CheckoutController::class, 'fastRegister'])->name('checkout.register');
Route::get('/checkout/{product:slug}', [CheckoutController::class, 'index'])->name('checkout');

Route::post('/webhooks/mercadopago', [App\Http\Controllers\MercadoPagoWebhookController::class, 'handle'])->name('webhooks.mercadopago');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    
    Route::get('/perfil', [UserDashboardController::class, 'profile'])->name('perfil');
    Route::patch('/perfil/actualizar', [UserDashboardController::class, 'updateProfile'])->name('perfil.update');
    Route::patch('/reservas/{reservation}/cancelar', [UserDashboardController::class, 'cancelReservation'])->name('reservas.cancel');
    Route::post('/reservas/{reservation}/solicitar-reembolso', [UserDashboardController::class, 'requestRefund'])->name('reservas.refund-request');
    Route::post('/favoritos/toggle/{product}', [UserDashboardController::class, 'toggleFavorite'])->name('favoritos.toggle');
    
    Route::get('/dashboard', function () {
        if (auth()->user()->rol === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('perfil');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/productos', [AdminController::class, 'products'])->name('admin.products');
    Route::post('/productos', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::put('/productos/{product}', [AdminController::class, 'updateProduct'])->name('admin.products.update');
    Route::delete('/productos/{product}', [AdminController::class, 'deleteProduct'])->name('admin.products.delete');
    Route::get('/inventario', [AdminController::class, 'inventory'])->name('admin.inventory');
    Route::post('/inventario', [AdminController::class, 'storeInventory'])->name('admin.inventory.store');
    Route::put('/inventario/{inventory}', [AdminController::class, 'updateInventory'])->name('admin.inventory.update');
    Route::patch('/inventario/{inventory}/status', [AdminController::class, 'updateInventoryStatus'])->name('admin.inventory.update-status');
    Route::delete('/inventario/{inventory}', [AdminController::class, 'deleteInventory'])->name('admin.inventory.delete');
    Route::get('/reservas', [AdminController::class, 'reservations'])->name('admin.reservations');
    Route::put('/reservas/{reservation}/status', [AdminController::class, 'updateReservationStatus'])->name('admin.reservations.update-status');
    Route::get('/pagos', [AdminController::class, 'payments'])->name('admin.payments');
    Route::patch('/pagos/{reservation}/registrar', [AdminController::class, 'registerPayment'])->name('admin.payments.register');
    Route::patch('/pagos/{reservation}/devolver-garantia', [AdminController::class, 'refundGuarantee'])->name('admin.payments.refund');
    Route::get('/usuarios', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/reportes', [AdminController::class, 'reports'])->name('admin.reports');
    Route::get('/configuracion', [AdminController::class, 'settings'])->name('admin.settings');
    Route::post('/configuracion', [AdminController::class, 'updateSettings'])->name('admin.settings.update');
    Route::get('/perfil', function () {
        return Inertia::render('admin/Profile');
    })->name('admin.profile');
    Route::patch('/perfil', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
    Route::post('/usuarios/admin', [AdminController::class, 'storeAdmin'])->name('admin.users.store-admin');
    Route::patch('/usuarios/{user}', [AdminController::class, 'updateUser'])->name('admin.users.update-user');
    Route::patch('/usuarios/{user}/status', [AdminController::class, 'updateUserStatus'])->name('admin.users.update-status');
    Route::patch('/usuarios/{user}/reset-password', [AdminController::class, 'resetUserPassword'])->name('admin.users.reset-password');
    Route::delete('/usuarios/{user}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
});

require __DIR__.'/settings.php';
