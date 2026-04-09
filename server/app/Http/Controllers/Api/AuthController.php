<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user (requires invite code).
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:student,teacher',
            'invite_code' => 'required|string',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify invite code
        $inviteCode = \App\Models\InviteCode::where('code', $request->invite_code)
            ->where('type', $request->role)
            ->where('active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->where('uses_count', '<', \DB::raw('max_uses'));
            })
            ->first();

        if (!$inviteCode) {
            return response()->json([
                'message' => 'Invalid or expired invitation code',
                'errors' => ['invite_code' => ['Invalid or expired invitation code']],
            ], 422);
        }

        $user = User::create([
            'school_id' => $inviteCode->school_id,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'verified' => false,
            'must_change_password' => true,
        ]);

        // Create profile
        \App\Models\Profile::create([
            'user_id' => $user->id,
            'type' => $request->role,
            'data' => [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
            ],
        ]);

        // Update invite code usage
        $inviteCode->increment('uses_count');
        if ($inviteCode->uses_count >= $inviteCode->max_uses) {
            $inviteCode->update(['active' => false]);
        }

        // Generate and send email verification code
        $verificationCode = rand(100000, 999999);
        // In production, send via email. For now, we'll store it.
        // TODO: Implement email sending

        return response()->json([
            'message' => 'Account created successfully. Please verify your email.',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'verified' => $user->verified,
                'must_change_password' => $user->must_change_password,
            ],
        ]);
    }

    /**
     * Get current authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('profile'),
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Send password reset link.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent']);
        }

        return response()->json([
            'message' => 'Unable to send reset link',
            'errors' => ['email' => [__($status)]],
        ], 422);
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'must_change_password' => false,
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successful']);
        }

        return response()->json([
            'message' => 'Unable to reset password',
            'errors' => ['email' => [__($status)]],
        ], 422);
    }

    /**
     * Verify email with code.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // TODO: Implement actual email verification logic
        // For now, this is a placeholder

        return response()->json(['message' => 'Email verified successfully']);
    }
}
