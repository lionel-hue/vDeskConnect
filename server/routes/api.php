<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UiIllustrationController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\AcademicController;

/*
|--------------------------------------------------------------------------
| API Routes — vDeskConnect v3.0
|--------------------------------------------------------------------------
*/

// Public UI Illustrations (must be outside auth middleware)
Route::prefix('ui')->group(function () {
    Route::get('/illustrations', [UiIllustrationController::class, 'index']);
    Route::get('/illustrations/active/{section}', [UiIllustrationController::class, 'bySection']);
});

// Auth routes (public)
Route::prefix('auth')->group(function () {
    Route::post('/send-verification', [AuthController::class, 'sendVerification']);
    Route::post('/verify', [AuthController::class, 'verifyEmail']);
    Route::post('/register-admin', [AuthController::class, 'registerAdmin']);
    Route::post('/register', [AuthController::class, 'register']); // internal, with invite code
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // UI Illustrations management (Super Admin only)
    Route::prefix('ui')->group(function () {
        Route::post('/illustrations/packs', [UiIllustrationController::class, 'uploadPack']);
        Route::put('/illustrations/packs/{packName}/activate', [UiIllustrationController::class, 'activatePack']);
        Route::get('/illustrations/packs', [UiIllustrationController::class, 'listPacks']);
        Route::delete('/illustrations/packs/{packName}', [UiIllustrationController::class, 'deletePack']);
    });

    // Students management
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::post('/', [StudentController::class, 'store']);
        Route::put('/{id}', [StudentController::class, 'update']);
        Route::post('/{id}/ban', [StudentController::class, 'ban']);
        Route::delete('/{id}', [StudentController::class, 'destroy']);
    });

    // Teachers management
    Route::prefix('teachers')->group(function () {
        Route::get('/', [TeacherController::class, 'index']);
        Route::post('/', [TeacherController::class, 'store']);
        Route::put('/{id}', [TeacherController::class, 'update']);
        Route::post('/{id}/ban', [TeacherController::class, 'ban']);
        Route::delete('/{id}', [TeacherController::class, 'destroy']);
    });

    // Staff management (Principal, Admin Staff, Receptionist)
    Route::prefix('staff')->group(function () {
        Route::get('/', [StaffController::class, 'index']);
        Route::post('/', [StaffController::class, 'store']);
        Route::put('/{id}', [StaffController::class, 'update']);
        Route::post('/{id}/ban', [StaffController::class, 'ban']);
        Route::delete('/{id}', [StaffController::class, 'destroy']);
    });

    // Academic Management (Phase 1)
    Route::prefix('academic')->group(function () {
        // Academic Sessions
        Route::prefix('sessions')->group(function () {
            Route::get('/', [AcademicController::class, 'sessionsIndex']);
            Route::post('/', [AcademicController::class, 'createSession']);
            Route::put('/{id}', [AcademicController::class, 'updateSession']);
            Route::put('/{id}/set-active', [AcademicController::class, 'setActiveSession']);
        });

        // Academic Terms
        Route::prefix('terms')->group(function () {
            Route::get('/', [AcademicController::class, 'termsIndex']); // requires session_id param
            Route::get('/session/{sessionId}', [AcademicController::class, 'termsIndex']);
            Route::post('/', [AcademicController::class, 'createTerm']);
            Route::post('/bulk', [AcademicController::class, 'bulkCreateTerms']);
            Route::put('/{id}', [AcademicController::class, 'updateTerm']);
            Route::delete('/{id}', [AcademicController::class, 'deleteTerm']);
        });

        // CA Weeks
        Route::prefix('ca-weeks')->group(function () {
            Route::get('/term/{termId}/grade/{gradeLevelId}/subject/{subjectId}', [AcademicController::class, 'caWeeksIndex']);
            Route::get('/term/{termId}/grade/{gradeLevelId}/subject/{subjectId}/summary', [AcademicController::class, 'caWeeksSummary']);
            Route::post('/', [AcademicController::class, 'setCaWeeks']);
        });

        // Grade Scales
        Route::prefix('grade-scales')->group(function () {
            Route::get('/', [AcademicController::class, 'gradeScalesIndex']);
            Route::post('/', [AcademicController::class, 'createGradeScale']);
            Route::put('/{id}', [AcademicController::class, 'updateGradeScale']);
            Route::put('/{id}/set-default', [AcademicController::class, 'setDefaultGradeScale']);
            Route::delete('/{id}', [AcademicController::class, 'deleteGradeScale']);
            Route::get('/templates', [AcademicController::class, 'getPresetTemplates']);
        });
    });
});
