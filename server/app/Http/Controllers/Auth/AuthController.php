<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use App\Models\InviteCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:student,teacher',
            'invitationCode' => 'required|string',
            'name' => 'required|string',
            // Add other profile fields as needed
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify invitation code
        $inviteCode = InviteCode::where('code', $request->invitationCode)
            ->where('user_type', $request->role)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$inviteCode) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired invitation code'
            ], 400);
        }

        // Create user
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'verified' => false,
            'school_id' => $inviteCode->school_id,
        ]);

        // Create profile
        Profile::create([
            'user_id' => $user->id,
            'type' => $request->role,
            'data' => [
                'name' => $request->name,
                // Add other profile data from request
            ]
        ]);

        // Mark invite code as used
        $inviteCode->update([
            'used' => true,
            'used_by' => $user->email,
            'used_at' => now()
        ]);

        // Generate verification code (send via email in production)
        $verificationCode = Str::random(6);
        // TODO: Send email with verification code

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your email.',
            'data' => [
                'userId' => $user->id,
                'email' => $user->email,
                'verificationCode' => $verificationCode // Remove in production
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:student,teacher,admin'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->verified) {
            return response()->json([
                'success' => false,
                'message' => 'User is not verified. Please verify your account.'
            ], 403);
        }

        if ($request->role === 'admin' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'User is not an admin'
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'name' => $user->profile->data['name'] ?? '',
                'token' => $token,
                'verified' => $user->verified
            ]
        ], 200);
    }

    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // TODO: Verify code against stored verification code
        // For now, accepting any 6-digit code (replace with actual verification)
        
        $user->update(['verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Account verified successfully'
        ], 200);
    }

    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $request->user()->id,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'name' => $request->user()->profile->data['name'] ?? ''
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        // Implement password reset logic
    }

    public function resetPassword(Request $request)
    {
        // Implement password reset logic
    }
}