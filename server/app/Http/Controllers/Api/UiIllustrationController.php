<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UiIllustration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UiIllustrationController extends Controller
{
    /**
     * Get all active illustrations (public endpoint).
     */
    public function index(): JsonResponse
    {
        $illustrations = UiIllustration::where('is_active', true)
            ->get(['id', 'key', 'url', 'section', 'pack_name']);

        return response()->json($illustrations);
    }

    /**
     * Get active illustrations for a specific section.
     */
    public function bySection(string $section): JsonResponse
    {
        $illustrations = UiIllustration::where('is_active', true)
            ->where('section', $section)
            ->get(['id', 'key', 'url', 'section', 'pack_name']);

        return response()->json($illustrations);
    }

    /**
     * Upload a new illustration pack (Super Admin only).
     * Accepts files via FormData: pack_name + illustrations[] (files).
     * Filename determines the key (e.g., "login_hero.svg" → key="login_hero").
     */
    public function uploadPack(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pack_name' => 'required|string|max:255',
            'illustrations' => 'required|array|min:1',
            'illustrations.*' => 'required|file|mimes:svg,png,jpg,jpeg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $packName = $request->input('pack_name');
        $uploaded = [];

        foreach ($request->file('illustrations') as $file) {
            // Derive key from filename (strip extension)
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();

            // Determine section from key prefix
            $section = $this->detectSection($filename);

            // Generate storage path
            $storageFilename = sprintf('%s/%s.%s', $packName, $filename, $extension);
            $path = $file->storeAs('illustrations', $storageFilename, 'public');
            $url = Storage::url($path);

            $uiIllustration = UiIllustration::create([
                'pack_name' => $packName,
                'key'       => $filename,
                'url'       => $url,
                'section'   => $section,
                'is_active' => false,
                'created_by' => $request->user()->id,
            ]);

            $uploaded[] = $uiIllustration;
        }

        return response()->json([
            'message'     => 'Illustration pack uploaded successfully',
            'pack_name'   => $packName,
            'illustrations' => $uploaded,
        ], 201);
    }

    /**
     * Detect section from illustration key.
     */
    private function detectSection(string $key): string
    {
        if (in_array($key, ['login_hero', 'signup_school', 'signup_admin', 'signup_verify', 'signup_password', 'email_verification', 'forgot_password', 'password_reset_sent', 'set_new_password', 'password_reset_success'])) {
            return 'auth';
        }
        if (str_starts_with($key, 'dashboard') || str_starts_with($key, 'superadmin')) {
            return 'dashboard';
        }
        if (str_starts_with($key, 'error')) {
            return 'errors';
        }
        if ($key === 'welcome_hero') {
            return 'landing';
        }
        return 'other';
    }

    /**
     * Activate an illustration pack.
     */
    public function activatePack(string $packName): JsonResponse
    {
        $illustrations = UiIllustration::where('pack_name', $packName)->get();

        if ($illustrations->isEmpty()) {
            return response()->json(['message' => 'Pack not found'], 404);
        }

        // Deactivate all currently active illustrations
        UiIllustration::where('is_active', true)->update(['is_active' => false]);

        // Activate all illustrations in this pack
        foreach ($illustrations as $illustration) {
            $illustration->update(['is_active' => true]);
        }

        return response()->json([
            'message' => 'Illustration pack activated',
            'pack_name' => $packName,
        ]);
    }

    /**
     * List all uploaded illustration packs.
     */
    public function listPacks(): JsonResponse
    {
        $packNames = UiIllustration::select('pack_name')
            ->distinct()
            ->pluck('pack_name');

        $packs = $packNames->map(function ($packName) {
            $total = UiIllustration::where('pack_name', $packName)->count();
            $activeCount = UiIllustration::where('pack_name', $packName)->where('is_active', true)->count();
            return [
                'pack_name' => $packName,
                'total_illustrations' => $total,
                'active_count' => $activeCount,
                'is_active' => $activeCount > 0,
                'created_at' => UiIllustration::where('pack_name', $packName)->min('created_at'),
            ];
        });

        return response()->json($packs->values()->toArray());
    }

    /**
     * Delete an illustration pack.
     */
    public function deletePack(string $packName): JsonResponse
    {
        $illustrations = UiIllustration::where('pack_name', $packName)->get();

        if ($illustrations->isEmpty()) {
            return response()->json(['message' => 'Pack not found'], 404);
        }

        // Delete files from storage
        foreach ($illustrations as $illustration) {
            $path = str_replace('/storage/', '', $illustration->url);
            Storage::disk('public')->delete($path);
        }

        // Delete database records
        UiIllustration::where('pack_name', $packName)->delete();

        return response()->json(['message' => 'Illustration pack deleted']);
    }
}
