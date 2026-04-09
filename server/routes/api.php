<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\School\SchoolConfigController;
use App\Http\Controllers\Invite\InviteController;

// Public Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify', [AuthController::class, 'verify']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // School Configuration
    Route::get('/school/config', [SchoolConfigController::class, 'index']);
    Route::put('/school/config', [SchoolConfigController::class, 'update']);

    // Invite Manager (Admin Only)
    Route::get('/invites', [InviteController::class, 'index']);
    Route::post('/invites/generate', [InviteController::class, 'generate']);
    Route::delete('/invites/{id}', [InviteController::class, 'destroy']);
    Route::post('/invites/{id}/regenerate', [InviteController::class, 'regenerate']);
});
