<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UiIllustrationController;

/*
|--------------------------------------------------------------------------
| API Routes — vDeskConnect v3.0
|--------------------------------------------------------------------------
*/

// Auth routes (public)
Route::prefix('auth')->group(function () {
    Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
    Route::post('/register', [AuthController::class, 'register']); // internal, with invite code
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify', [AuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // UI Illustrations (public for reading, protected for management)
    Route::prefix('ui')->group(function () {
        Route::get('/illustrations', [UiIllustrationController::class, 'index']);
        Route::get('/illustrations/active/{section}', [UiIllustrationController::class, 'bySection']);

        // Super Admin only routes (TODO: Add role-based middleware)
        Route::post('/illustrations/packs', [UiIllustrationController::class, 'uploadPack']);
        Route::put('/illustrations/packs/{packName}/activate', [UiIllustrationController::class, 'activatePack']);
        Route::get('/illustrations/packs', [UiIllustrationController::class, 'listPacks']);
        Route::delete('/illustrations/packs/{packName}', [UiIllustrationController::class, 'deletePack']);
    });
});
