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
     */
    public function uploadPack(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pack_name' => 'required|string|max:255',
            'illustrations' => 'required|array|min:1',
            'illustrations.*.key' => 'required|string|max:100',
            'illustrations.*.section' => 'required|string|in:login,signup,dashboard,errors,empty_states',
            'illustrations.*.file' => 'required|file|mimes:svg,png,jpg,jpeg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $packName = $request->input('pack_name');
        $uploaded = [];

        foreach ($request->input('illustrations') as $illustration) {
            $file = $illustration['file'];

            // Generate unique filename
            $extension = $file->getClientOriginalExtension();
            $filename = sprintf('%s/%s.%s', $packName, $illustration['key'], $extension);

            // Store in public disk
            $path = $file->storeAs('illustrations', $filename, 'public');
            $url = Storage::url($path);

            $uiIllustration = UiIllustration::create([
                'pack_name' => $packName,
                'key' => $illustration['key'],
                'url' => $url,
                'section' => $illustration['section'],
                'is_active' => false,
                'created_by' => $request->user()->id,
            ]);

            $uploaded[] = $uiIllustration;
        }

        return response()->json([
            'message' => 'Illustration pack uploaded successfully',
            'pack_name' => $packName,
            'illustrations' => $uploaded,
        ], 201);
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
        $packs = UiIllustration::select('pack_name')
            ->distinct()
            ->withCount(['illustrations' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get()
            ->map(function ($item) {
                return [
                    'pack_name' => $item->pack_name,
                    'total_illustrations' => UiIllustration::where('pack_name', $item->pack_name)->count(),
                    'active_count' => UiIllustration::where('pack_name', $item->pack_name)->where('is_active', true)->count(),
                    'is_active' => UiIllustration::where('pack_name', $item->pack_name)->where('is_active', true)->exists(),
                    'created_at' => UiIllustration::where('pack_name', $item->pack_name)->min('created_at'),
                ];
            });

        return response()->json($packs);
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
