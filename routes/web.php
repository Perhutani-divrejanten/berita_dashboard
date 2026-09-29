<?php

use App\Http\Controllers\BeritaSheetsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureStaffRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Redirect root
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', EnsureStaffRole::class])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/history-berita', [DashboardController::class, 'revisions'])->name('sheets-berita.revisions');

    // ===== KATEGORI =====
    Route::resource('kategori', KategoriController::class)
        ->parameters(['kategori' => 'kategori']);
    Route::post('kategori/{id}/restore', [KategoriController::class, 'restore'])
        ->name('kategori.restore');

    // ===== PENGGUNA =====
    Route::resource('users', UserController::class)->except(['show']);

    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', EnsureStaffRole::class])->group(function () {
    Route::prefix('sheets-berita')
        ->name('sheets-berita.')
        ->group(function () {
            Route::get('/', [BeritaSheetsController::class, 'index'])->name('index');
            Route::get('/create', [BeritaSheetsController::class, 'create'])->name('create');
            Route::get('/drive-image/{fileId}', [BeritaSheetsController::class, 'driveImage'])
                ->where('fileId', '[A-Za-z0-9_-]{20,200}')
                ->name('drive-image');
            Route::post('/', [BeritaSheetsController::class, 'store'])->name('store');
            Route::get('/{slug}', [BeritaSheetsController::class, 'show'])->name('show');
            Route::get('/{slug}/history', [BeritaSheetsController::class, 'history'])->name('history');
            Route::get('/{slug}/edit', [BeritaSheetsController::class, 'edit'])->name('edit');
            Route::put('/{slug}', [BeritaSheetsController::class, 'update'])->name('update');
            Route::delete('/{slug}', [BeritaSheetsController::class, 'destroy'])->name('destroy');
        });
});

require __DIR__.'/auth.php';
