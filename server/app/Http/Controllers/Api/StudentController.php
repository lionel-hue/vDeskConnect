<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    /**
     * List all students for the authenticated user's school.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = min((int) $request->get('per_page', 20), 100);
        $search = $request->get('search');

        $query = User::where('school_id', $user->school_id)
            ->where('role', 'student')
            ->with(['profile', 'school'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%");
                $q->orWhereHas('profile', function ($pq) use ($search) {
                    $pq->where('data->first_name', 'like', "%{$search}%");
                    $pq->orWhere('data->last_name', 'like', "%{$search}%");
                    $pq->orWhere('data->admission_number', 'like', "%{$search}%");
                });
            });
        }

        $students = $query->paginate($perPage);

        return response()->json($students);
    }

    /**
     * Create a new student.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'admission_number' => 'required|string|max:100',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:50',
            'guardian_email' => 'nullable|email|max:255',
            'grade_level_id' => 'nullable|exists:grade_levels,id',
            'section_id' => 'nullable|exists:sections,id',
            'department_id' => 'nullable|exists:departments,id',
            'password' => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        // Verify the user has permission to create students
        if ($user->isSuperAdmin() || $user->isTeacher()) {
            return response()->json(['message' => 'You do not have permission to create students'], 403);
        }

        $tempPassword = $request->password ?: 'Secret123!';

        return DB::transaction(function () use ($request, $tempPassword, $user) {
            $student = User::create([
                'school_id' => $user->school_id,
                'email' => $request->email,
                'password' => Hash::make($tempPassword),
                'role' => 'student',
                'verified' => true,
                'must_change_password' => true,
            ]);

            $profileData = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'admission_number' => $request->admission_number,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
                'phone' => $request->phone,
                'address' => $request->address,
                'guardian_name' => $request->guardian_name,
                'guardian_phone' => $request->guardian_phone,
                'guardian_email' => $request->guardian_email,
                'grade_level_id' => $request->grade_level_id,
                'section_id' => $request->section_id,
                'department_id' => $request->department_id,
            ];

            Profile::create([
                'user_id' => $student->id,
                'type' => 'student',
                'data' => $profileData,
            ]);

            return response()->json([
                'message' => 'Student created successfully',
                'student' => $this->formatStudentResponse($student),
                'temporary_password' => $tempPassword,
            ], 201);
        });
    }

    /**
     * Update a student.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $student = User::where('school_id', $user->school_id)
            ->where('role', 'student')
            ->with('profile')
            ->findOrFail($id);

        // Permission check
        if (!$user->canManage($student) && !$user->isSchoolAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'admission_number' => 'sometimes|string|max:100',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:50',
            'guardian_email' => 'nullable|email|max:255',
            'grade_level_id' => 'nullable|exists:grade_levels,id',
            'section_id' => 'nullable|exists:sections,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('email')) {
            $student->email = $request->email;
        }
        $student->save();

        if ($student->profile) {
            $data = $student->profile->data ?? [];
            $fields = ['first_name', 'last_name', 'admission_number', 'gender',
                      'date_of_birth', 'phone', 'address', 'guardian_name',
                      'guardian_phone', 'guardian_email', 'grade_level_id',
                      'section_id', 'department_id'];
            foreach ($fields as $field) {
                if ($request->has($field)) {
                    $data[$field] = $request[$field];
                }
            }
            $student->profile->data = $data;
            $student->profile->save();
        }

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $this->formatStudentResponse($student),
        ]);
    }

    /**
     * Ban a student.
     */
    public function ban(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Reason is required', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $student = User::where('school_id', $user->school_id)
            ->where('role', 'student')
            ->findOrFail($id);

        if (!$user->canManage($student)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student->banned = true;
        $student->save();

        // Log ban in user_bans table
        DB::table('user_bans')->insert([
            'user_id' => $student->id,
            'banned_by' => $user->id,
            'action_type' => 'ban',
            'reason' => $request->reason,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Student banned successfully']);
    }

    /**
     * Delete a student.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Reason is required', 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $student = User::where('school_id', $user->school_id)
            ->where('role', 'student')
            ->findOrFail($id);

        if (!$user->canManage($student) && !$user->isSchoolAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Log deletion
        DB::table('user_bans')->insert([
            'user_id' => $student->id,
            'banned_by' => $user->id,
            'action_type' => 'delete',
            'reason' => $request->reason,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }

    private function formatStudentResponse(User $student): array
    {
        $data = $student->profile?->data ?? [];
        return [
            'id' => $student->id,
            'email' => $student->email,
            'role' => $student->role,
            'verified' => $student->verified,
            'banned' => $student->banned,
            'must_change_password' => $student->must_change_password,
            'first_name' => $data['first_name'] ?? '',
            'last_name' => $data['last_name'] ?? '',
            'admission_number' => $data['admission_number'] ?? '',
            'gender' => $data['gender'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'guardian_name' => $data['guardian_name'] ?? null,
            'guardian_phone' => $data['guardian_phone'] ?? null,
            'guardian_email' => $data['guardian_email'] ?? null,
            'grade_level_id' => $data['grade_level_id'] ?? null,
            'section_id' => $data['section_id'] ?? null,
            'department_id' => $data['department_id'] ?? null,
            'avatar_url' => $student->profile?->avatar_url,
            'created_at' => $student->created_at,
        ];
    }
}
