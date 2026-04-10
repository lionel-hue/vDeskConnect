<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use App\Models\CaWeek;
use App\Models\GradeScale;
use App\Models\GradeLevel;
use App\Models\Subject;
use App\Models\Department;
use App\Models\Section;
use App\Models\GradeLevelSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AcademicController extends Controller
{
    // ==================== ACADEMIC SESSIONS ====================

    /**
     * List all academic sessions for the authenticated user's school.
     */
    public function sessionsIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $sessions = AcademicSession::where('school_id', $user->school_id)
            ->withCount('terms')
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'start_date' => $session->start_date->format('Y-m-d'),
                    'end_date' => $session->end_date->format('Y-m-d'),
                    'active' => $session->active,
                    'terms_count' => $session->terms_count,
                    'created_at' => $session->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json(['sessions' => $sessions]);
    }

    /**
     * Create a new academic session.
     */
    public function createSession(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // If this session is set to active, deactivate all other sessions
        if ($request->active) {
            AcademicSession::where('school_id', $user->school_id)
                ->where('active', true)
                ->update(['active' => false]);
        }

        $session = AcademicSession::create([
            'school_id' => $user->school_id,
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'active' => $request->active ?? false,
        ]);

        return response()->json([
            'message' => 'Academic session created successfully',
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'start_date' => $session->start_date->format('Y-m-d'),
                'end_date' => $session->end_date->format('Y-m-d'),
                'active' => $session->active,
            ],
        ], 201);
    }

    /**
     * Update an academic session.
     */
    public function updateSession(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $session = AcademicSession::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If setting to active, deactivate others
        if ($request->has('active') && $request->active) {
            AcademicSession::where('school_id', $user->school_id)
                ->where('id', '!=', $id)
                ->where('active', true)
                ->update(['active' => false]);
        }

        $session->update($request->only(['name', 'start_date', 'end_date', 'active']));

        return response()->json([
            'message' => 'Academic session updated successfully',
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'start_date' => $session->start_date->format('Y-m-d'),
                'end_date' => $session->end_date->format('Y-m-d'),
                'active' => $session->active,
            ],
        ]);
    }

    /**
     * Set a session as active.
     */
    public function setActiveSession(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        return DB::transaction(function () use ($user, $id) {
            // Deactivate all sessions
            AcademicSession::where('school_id', $user->school_id)
                ->where('active', true)
                ->update(['active' => false]);

            // Activate the requested session
            $session = AcademicSession::where('school_id', $user->school_id)
                ->findOrFail($id);
            $session->update(['active' => true]);

            return response()->json([
                'message' => 'Session set as active',
                'session' => [
                    'id' => $session->id,
                    'name' => $session->name,
                    'active' => $session->active,
                ],
            ]);
        });
    }

    /**
     * Delete an academic session (cascades to terms, ca_weeks, exams, etc.).
     */
    public function deleteSession(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $session = AcademicSession::where('school_id', $user->school_id)->findOrFail($id);

        // Prevent deleting if it's the only active session
        $activeCount = AcademicSession::where('school_id', $user->school_id)->where('active', true)->count();
        if ($session->active && $activeCount <= 1) {
            return response()->json([
                'message' => 'Cannot delete the only active session. Create another session and set it as active first.',
            ], 400);
        }

        $session->delete();

        return response()->json(['message' => 'Academic session and all associated data deleted successfully']);
    }

    // ==================== ACADEMIC TERMS ====================

    /**
     * List terms for a specific session.
     */
    public function termsIndex(Request $request, int $sessionId): JsonResponse
    {
        $user = $request->user();

        $terms = AcademicTerm::where('school_id', $user->school_id)
            ->where('session_id', $sessionId)
            ->ordered()
            ->get()
            ->map(function ($term) {
                return [
                    'id' => $term->id,
                    'session_id' => $term->session_id,
                    'name' => $term->name,
                    'start_date' => $term->start_date->format('Y-m-d'),
                    'end_date' => $term->end_date->format('Y-m-d'),
                    'order' => $term->order,
                    'weeks_count' => $term->weeks_count,
                    'created_at' => $term->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json(['terms' => $terms]);
    }

    /**
     * Create a new academic term.
     */
    public function createTerm(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:academic_sessions,id',
            'name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'order' => 'required|integer|min:1',
            'weeks_count' => 'required|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Verify session belongs to user's school
        $session = AcademicSession::where('school_id', $user->school_id)
            ->findOrFail($request->session_id);

        $term = AcademicTerm::create([
            'school_id' => $user->school_id,
            'session_id' => $session->id,
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'order' => $request->order,
            'weeks_count' => $request->weeks_count,
        ]);

        return response()->json([
            'message' => 'Academic term created successfully',
            'term' => [
                'id' => $term->id,
                'session_id' => $term->session_id,
                'name' => $term->name,
                'start_date' => $term->start_date->format('Y-m-d'),
                'end_date' => $term->end_date->format('Y-m-d'),
                'order' => $term->order,
                'weeks_count' => $term->weeks_count,
            ],
        ], 201);
    }

    /**
     * Bulk create terms for a session.
     */
    public function bulkCreateTerms(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:academic_sessions,id',
            'terms_count' => 'required|integer|min:1|max:4',
            'weeks_per_term' => 'required|integer|min:1|max:20',
            'term_prefix' => 'required|string|max:50', // e.g., "Term", "Trimester", "Semester"
            'start_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $session = AcademicSession::where('school_id', $user->school_id)
            ->findOrFail($request->session_id);

        // Check if terms already exist for this session
        $existingTerms = AcademicTerm::where('session_id', $session->id)->count();
        if ($existingTerms > 0) {
            return response()->json([
                'message' => 'Terms already exist for this session. Delete existing terms first.',
            ], 409);
        }

        return DB::transaction(function () use ($request, $session, $user) {
            $terms = [];
            $weeksPerTerm = $request->weeks_per_term;
            $startDate = \Carbon\Carbon::parse($request->start_date);

            for ($i = 1; $i <= $request->terms_count; $i++) {
                $termStart = $startDate->copy()->addWeeks(($i - 1) * $weeksPerTerm);
                $termEnd = $termStart->copy()->addWeeks($weeksPerTerm)->subDay();

                $term = AcademicTerm::create([
                    'school_id' => $user->school_id,
                    'session_id' => $session->id,
                    'name' => "{$request->term_prefix} {$i}",
                    'start_date' => $termStart->format('Y-m-d'),
                    'end_date' => $termEnd->format('Y-m-d'),
                    'order' => $i,
                    'weeks_count' => $weeksPerTerm,
                ]);

                $terms[] = [
                    'id' => $term->id,
                    'name' => $term->name,
                    'start_date' => $term->start_date->format('Y-m-d'),
                    'end_date' => $term->end_date->format('Y-m-d'),
                    'order' => $term->order,
                    'weeks_count' => $term->weeks_count,
                ];
            }

            return response()->json([
                'message' => "Created {$request->terms_count} terms successfully",
                'terms' => $terms,
            ], 201);
        });
    }

    /**
     * Update an academic term.
     */
    public function updateTerm(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $term = AcademicTerm::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'order' => 'sometimes|integer|min:1',
            'weeks_count' => 'sometimes|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $term->update($request->only(['name', 'start_date', 'end_date', 'order', 'weeks_count']));

        return response()->json([
            'message' => 'Academic term updated successfully',
            'term' => [
                'id' => $term->id,
                'name' => $term->name,
                'start_date' => $term->start_date->format('Y-m-d'),
                'end_date' => $term->end_date->format('Y-m-d'),
                'order' => $term->order,
                'weeks_count' => $term->weeks_count,
            ],
        ]);
    }

    /**
     * Delete an academic term.
     */
    public function deleteTerm(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $term = AcademicTerm::where('school_id', $user->school_id)->findOrFail($id);

        $term->delete();

        return response()->json(['message' => 'Academic term deleted successfully']);
    }

    // ==================== CA WEEKS ====================

    /**
     * Get CA week configuration for a grade + subject + term.
     */
    public function caWeeksIndex(Request $request, int $termId, int $gradeLevelId, int $subjectId): JsonResponse
    {
        $user = $request->user();

        $caWeeks = CaWeek::where('school_id', $user->school_id)
            ->where('term_id', $termId)
            ->where('grade_level_id', $gradeLevelId)
            ->where('subject_id', $subjectId)
            ->ordered()
            ->get()
            ->map(function ($caWeek) {
                return [
                    'id' => $caWeek->id,
                    'week_number' => $caWeek->week_number,
                    'is_test_week' => $caWeek->is_test_week,
                    'is_exam_week' => $caWeek->is_exam_week,
                ];
            });

        return response()->json(['ca_weeks' => $caWeeks]);
    }

    /**
     * Set CA week configuration (bulk).
     */
    public function setCaWeeks(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'term_id' => 'required|exists:academic_terms,id',
            'grade_level_id' => 'required|exists:grade_levels,id',
            'subject_id' => 'required|exists:subjects,id',
            'weeks_count' => 'required|integer|min:1|max:20',
            'test_weeks' => 'required|array', // Array of week numbers that are test weeks
            'test_weeks.*' => 'integer|min:1|max:20',
            'exam_week' => 'required|integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Verify all entities belong to user's school
        $term = AcademicTerm::where('school_id', $user->school_id)->findOrFail($request->term_id);
        $gradeLevel = GradeLevel::where('school_id', $user->school_id)->findOrFail($request->grade_level_id);
        $subject = Subject::where('school_id', $user->school_id)->findOrFail($request->subject_id);

        return DB::transaction(function () use ($request, $user, $term, $gradeLevel, $subject) {
            // Delete existing CA weeks for this combination
            CaWeek::where('school_id', $user->school_id)
                ->where('term_id', $term->id)
                ->where('grade_level_id', $gradeLevel->id)
                ->where('subject_id', $subject->id)
                ->delete();

            // Create new CA weeks
            $caWeeks = [];
            for ($week = 1; $week <= $request->weeks_count; $week++) {
                $caWeek = CaWeek::create([
                    'school_id' => $user->school_id,
                    'term_id' => $term->id,
                    'grade_level_id' => $gradeLevel->id,
                    'subject_id' => $subject->id,
                    'week_number' => $week,
                    'is_test_week' => in_array($week, $request->test_weeks),
                    'is_exam_week' => $week === $request->exam_week,
                ]);

                $caWeeks[] = [
                    'id' => $caWeek->id,
                    'week_number' => $caWeek->week_number,
                    'is_test_week' => $caWeek->is_test_week,
                    'is_exam_week' => $caWeek->is_exam_week,
                ];
            }

            $testWeeksStr = implode(', ', $request->test_weeks);

            return response()->json([
                'message' => "CA weeks configured. Tests at weeks: {$testWeeksStr}, Exam at week: {$request->exam_week}",
                'ca_weeks' => $caWeeks,
            ], 201);
        });
    }

    /**
     * Get CA summary for a grade + subject + term.
     */
    public function caWeeksSummary(Request $request, int $termId, int $gradeLevelId, int $subjectId): JsonResponse
    {
        $user = $request->user();

        $caWeeks = CaWeek::where('school_id', $user->school_id)
            ->where('term_id', $termId)
            ->where('grade_level_id', $gradeLevelId)
            ->where('subject_id', $subjectId)
            ->ordered()
            ->get();

        $testWeeks = $caWeeks->where('is_test_week', true)->pluck('week_number')->toArray();
        $examWeek = $caWeeks->firstWhere('is_exam_week', true);

        return response()->json([
            'summary' => [
                'test_weeks' => $testWeeks,
                'exam_week' => $examWeek ? $examWeek->week_number : null,
                'total_weeks' => $caWeeks->count(),
                'test_weeks_display' => $testWeeks ? implode(', ', $testWeeks) : 'None',
                'exam_week_display' => $examWeek ? "Week {$examWeek->week_number}" : 'Not set',
            ],
        ]);
    }

    // ==================== GRADE SCALES ====================

    /**
     * List all grade scales for the school.
     */
    public function gradeScalesIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $gradeScales = GradeScale::where('school_id', $user->school_id)
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($scale) {
                return [
                    'id' => $scale->id,
                    'name' => $scale->name,
                    'scale' => $scale->scale,
                    'is_default' => $scale->is_default,
                    'created_at' => $scale->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json(['grade_scales' => $gradeScales]);
    }

    /**
     * Create a new grade scale.
     */
    public function createGradeScale(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'scale' => 'required|array|min:1',
            'scale.*.min' => 'required|numeric|min:0|max:100',
            'scale.*.max' => 'required|numeric|min:0|max:100|gte:scale.*.min',
            'scale.*.remark' => 'required|string|max:50',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // If setting as default, unset other defaults
        if ($request->is_default) {
            GradeScale::where('school_id', $user->school_id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $gradeScale = GradeScale::create([
            'school_id' => $user->school_id,
            'name' => $request->name,
            'scale' => $request->scale,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json([
            'message' => 'Grade scale created successfully',
            'grade_scale' => [
                'id' => $gradeScale->id,
                'name' => $gradeScale->name,
                'scale' => $gradeScale->scale,
                'is_default' => $gradeScale->is_default,
            ],
        ], 201);
    }

    /**
     * Update a grade scale.
     */
    public function updateGradeScale(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $gradeScale = GradeScale::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'scale' => 'sometimes|array|min:1',
            'scale.*.min' => 'required|numeric|min:0|max:100',
            'scale.*.max' => 'required|numeric|min:0|max:100|gte:scale.*.min',
            'scale.*.remark' => 'required|string|max:50',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If setting as default, unset other defaults
        if ($request->has('is_default') && $request->is_default) {
            GradeScale::where('school_id', $user->school_id)
                ->where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $gradeScale->update($request->only(['name', 'scale', 'is_default']));

        return response()->json([
            'message' => 'Grade scale updated successfully',
            'grade_scale' => [
                'id' => $gradeScale->id,
                'name' => $gradeScale->name,
                'scale' => $gradeScale->scale,
                'is_default' => $gradeScale->is_default,
            ],
        ]);
    }

    /**
     * Set a grade scale as default.
     */
    public function setDefaultGradeScale(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        return DB::transaction(function () use ($user, $id) {
            GradeScale::where('school_id', $user->school_id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $gradeScale = GradeScale::where('school_id', $user->school_id)
                ->findOrFail($id);
            $gradeScale->update(['is_default' => true]);

            return response()->json([
                'message' => 'Default grade scale updated',
                'grade_scale' => [
                    'id' => $gradeScale->id,
                    'name' => $gradeScale->name,
                    'is_default' => $gradeScale->is_default,
                ],
            ]);
        });
    }

    /**
     * Delete a grade scale.
     */
    public function deleteGradeScale(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $gradeScale = GradeScale::where('school_id', $user->school_id)->findOrFail($id);

        if ($gradeScale->is_default) {
            return response()->json([
                'message' => 'Cannot delete the default grade scale. Set another scale as default first.',
            ], 400);
        }

        $gradeScale->delete();

        return response()->json(['message' => 'Grade scale deleted successfully']);
    }

    /**
     * Get preset grade scale templates (Nigerian WAEC, American GPA, French Baccalaureat).
     */
    public function getPresetTemplates(): JsonResponse
    {
        $templates = [
            'nigerian_waec' => [
                'name' => 'Nigerian WAEC',
                'scale' => [
                    'A' => ['min' => 70, 'max' => 100, 'remark' => 'Excellent'],
                    'B2' => ['min' => 65, 'max' => 69, 'remark' => 'Very Good'],
                    'B3' => ['min' => 60, 'max' => 64, 'remark' => 'Good'],
                    'C4' => ['min' => 55, 'max' => 59, 'remark' => 'Credit'],
                    'C5' => ['min' => 50, 'max' => 54, 'remark' => 'Credit'],
                    'C6' => ['min' => 45, 'max' => 49, 'remark' => 'Credit'],
                    'D7' => ['min' => 40, 'max' => 44, 'remark' => 'Pass'],
                    'E8' => ['min' => 35, 'max' => 39, 'remark' => 'Pass'],
                    'F9' => ['min' => 0, 'max' => 34, 'remark' => 'Fail'],
                ],
            ],
            'american_gpa' => [
                'name' => 'American GPA (4.0 Scale)',
                'scale' => [
                    'A' => ['min' => 90, 'max' => 100, 'remark' => 'Excellent', 'gpa' => 4.0],
                    'B' => ['min' => 80, 'max' => 89, 'remark' => 'Good', 'gpa' => 3.0],
                    'C' => ['min' => 70, 'max' => 79, 'remark' => 'Average', 'gpa' => 2.0],
                    'D' => ['min' => 60, 'max' => 69, 'remark' => 'Below Average', 'gpa' => 1.0],
                    'F' => ['min' => 0, 'max' => 59, 'remark' => 'Fail', 'gpa' => 0.0],
                ],
            ],
            'french_baccalaureat' => [
                'name' => 'French Baccalaureat (20-point scale)',
                'scale' => [
                    'Très Bien' => ['min' => 16, 'max' => 20, 'remark' => 'Very Good'],
                    'Bien' => ['min' => 14, 'max' => 15, 'remark' => 'Good'],
                    'Assez Bien' => ['min' => 12, 'max' => 13, 'remark' => 'Fairly Good'],
                    'Passable' => ['min' => 10, 'max' => 11, 'remark' => 'Pass'],
                    'Insuffisant' => ['min' => 0, 'max' => 9, 'remark' => 'Fail'],
                ],
            ],
            'percentage_standard' => [
                'name' => 'Standard Percentage',
                'scale' => [
                    'A' => ['min' => 70, 'max' => 100, 'remark' => 'Excellent'],
                    'B' => ['min' => 60, 'max' => 69, 'remark' => 'Good'],
                    'C' => ['min' => 50, 'max' => 59, 'remark' => 'Average'],
                    'D' => ['min' => 40, 'max' => 49, 'remark' => 'Below Average'],
                    'F' => ['min' => 0, 'max' => 39, 'remark' => 'Fail'],
                ],
            ],
        ];

        return response()->json(['templates' => $templates]);
    }

    // ==================== GRADE LEVELS ====================

    /**
     * List all grade levels for the school.
     */
    public function gradeLevelsIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $gradeLevels = GradeLevel::where('school_id', $user->school_id)
            ->ordered()
            ->get()
            ->map(function ($gl) {
                return [
                    'id' => $gl->id,
                    'name' => $gl->name,
                    'short_name' => $gl->short_name,
                    'order' => $gl->order,
                    'cycle' => $gl->cycle,
                ];
            });

        return response()->json(['grade_levels' => $gradeLevels]);
    }

    // ==================== SUBJECTS ====================

    /**
     * List all subjects for the school.
     */
    public function subjectsIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $subjects = Subject::where('school_id', $user->school_id)
            ->orderBy('name')
            ->get()
            ->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'type' => $subject->type,
                ];
            });

        return response()->json(['subjects' => $subjects]);
    }

    // ==================== PHASE 2: GRADE LEVELS CRUD ====================

    /**
     * Create a grade level.
     */
    public function createGradeLevel(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'short_name' => 'nullable|string|max:50',
            'order' => 'required|integer|min:1',
            'cycle' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $gradeLevel = GradeLevel::create([
            'school_id' => $user->school_id,
            'name' => $request->name,
            'short_name' => $request->short_name,
            'order' => $request->order,
            'cycle' => $request->cycle,
        ]);

        return response()->json([
            'message' => 'Grade level created successfully',
            'grade_level' => $gradeLevel,
        ], 201);
    }

    /**
     * Update a grade level.
     */
    public function updateGradeLevel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $gradeLevel = GradeLevel::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'short_name' => 'nullable|string|max:50',
            'order' => 'sometimes|integer|min:1',
            'cycle' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $gradeLevel->update($request->only(['name', 'short_name', 'order', 'cycle']));

        return response()->json([
            'message' => 'Grade level updated successfully',
            'grade_level' => $gradeLevel,
        ]);
    }

    /**
     * Delete a grade level.
     */
    public function deleteGradeLevel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $gradeLevel = GradeLevel::where('school_id', $user->school_id)->findOrFail($id);

        // Check if any students or sections are using this grade level
        if ($gradeLevel->sections()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete grade level with existing sections. Delete sections first.',
            ], 400);
        }

        $gradeLevel->delete();

        return response()->json(['message' => 'Grade level deleted successfully']);
    }

    /**
     * Bulk create grade levels (e.g., JSS1, JSS2, JSS3 all at once).
     */
    public function bulkCreateGradeLevels(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prefix' => 'required|string|max:50', // e.g., "JSS"
            'start_order' => 'required|integer|min:1',
            'count' => 'required|integer|min:1|max:20',
            'cycle' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $gradeLevels = [];
            for ($i = 0; $i < $request->count; $i++) {
                $order = $request->start_order + $i;
                $gradeLevel = GradeLevel::create([
                    'school_id' => $user->school_id,
                    'name' => "{$request->prefix} {$order}",
                    'short_name' => "{$request->prefix}{$order}",
                    'order' => $order,
                    'cycle' => $request->cycle,
                ]);
                $gradeLevels[] = $gradeLevel;
            }

            return response()->json([
                'message' => "Created {$request->count} grade levels",
                'grade_levels' => $gradeLevels,
            ], 201);
        });
    }

    // ==================== PHASE 2: SECTIONS CRUD ====================

    /**
     * List sections for a grade level.
     */
    public function sectionsIndex(Request $request, int $gradeLevelId): JsonResponse
    {
        $user = $request->user();

        $sections = Section::where('school_id', $user->school_id)
            ->where('grade_level_id', $gradeLevelId)
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'grade_level_id' => $section->grade_level_id,
                    'name' => $section->name,
                    'room_number' => $section->room_number,
                    'capacity' => $section->capacity,
                ];
            });

        return response()->json(['sections' => $sections]);
    }

    /**
     * Create a section.
     */
    public function createSection(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'grade_level_id' => 'required|exists:grade_levels,id',
            'name' => 'required|string|max:50',
            'room_number' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $gradeLevel = GradeLevel::where('school_id', $user->school_id)
            ->findOrFail($request->grade_level_id);

        $section = Section::create([
            'school_id' => $user->school_id,
            'grade_level_id' => $gradeLevel->id,
            'name' => $request->name,
            'room_number' => $request->room_number,
            'capacity' => $request->capacity,
        ]);

        return response()->json([
            'message' => 'Section created successfully',
            'section' => $section,
        ], 201);
    }

    /**
     * Update a section.
     */
    public function updateSection(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $section = Section::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:50',
            'room_number' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $section->update($request->only(['name', 'room_number', 'capacity']));

        return response()->json([
            'message' => 'Section updated successfully',
            'section' => $section,
        ]);
    }

    /**
     * Delete a section.
     */
    public function deleteSection(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $section = Section::where('school_id', $user->school_id)->findOrFail($id);

        $section->delete();

        return response()->json(['message' => 'Section deleted successfully']);
    }

    // ==================== PHASE 2: DEPARTMENTS CRUD ====================

    /**
     * List all departments for the school.
     */
    public function departmentsIndex(Request $request): JsonResponse
    {
        $user = $request->user();

        $departments = Department::where('school_id', $user->school_id)
            ->orderBy('name')
            ->get()
            ->map(function ($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'code' => $dept->code,
                ];
            });

        return response()->json(['departments' => $departments]);
    }

    /**
     * Create a department.
     */
    public function createDepartment(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $department = Department::create([
            'school_id' => $user->school_id,
            'name' => $request->name,
            'code' => $request->code,
        ]);

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department,
        ], 201);
    }

    /**
     * Update a department.
     */
    public function updateDepartment(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $department = Department::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'code' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $department->update($request->only(['name', 'code']));

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department,
        ]);
    }

    /**
     * Delete a department.
     */
    public function deleteDepartment(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $department = Department::where('school_id', $user->school_id)->findOrFail($id);

        if ($department->subjects()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete department with assigned subjects. Reassign or delete subjects first.',
            ], 400);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }

    // ==================== PHASE 2: SUBJECTS CRUD ====================

    /**
     * Create a subject.
     */
    public function createSubject(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:20',
            'type' => 'required|in:core,elective,departmental',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $subject = Subject::create([
            'school_id' => $user->school_id,
            'name' => $request->name,
            'code' => $request->code,
            'type' => $request->type,
            'department_id' => $request->department_id,
        ]);

        return response()->json([
            'message' => 'Subject created successfully',
            'subject' => $subject,
        ], 201);
    }

    /**
     * Update a subject.
     */
    public function updateSubject(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $subject = Subject::where('school_id', $user->school_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'code' => 'nullable|string|max:20',
            'type' => 'sometimes|in:core,elective,departmental',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $subject->update($request->only(['name', 'code', 'type', 'department_id']));

        return response()->json([
            'message' => 'Subject updated successfully',
            'subject' => $subject,
        ]);
    }

    /**
     * Delete a subject.
     */
    public function deleteSubject(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $subject = Subject::where('school_id', $user->school_id)->findOrFail($id);

        $subject->delete();

        return response()->json(['message' => 'Subject deleted successfully']);
    }

    // ==================== PHASE 2: SUBJECT-TO-GRADE MAPPINGS ====================

    /**
     * Get subjects assigned to a grade level.
     */
    public function gradeLevelSubjects(Request $request, int $gradeLevelId): JsonResponse
    {
        $user = $request->user();

        $mappings = GradeLevelSubject::where('school_id', $user->school_id)
            ->where('grade_level_id', $gradeLevelId)
            ->with(['subject', 'department'])
            ->get()
            ->map(function ($mapping) {
                return [
                    'id' => $mapping->id,
                    'subject_id' => $mapping->subject_id,
                    'subject_name' => $mapping->subject->name,
                    'subject_code' => $mapping->subject->code,
                    'subject_type' => $mapping->subject->type,
                    'is_compulsory' => $mapping->is_compulsory,
                    'department_id' => $mapping->department_id,
                    'department_name' => $mapping->department?->name,
                ];
            });

        return response()->json(['mappings' => $mappings]);
    }

    /**
     * Assign a subject to a grade level.
     */
    public function assignSubjectToGrade(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'grade_level_id' => 'required|exists:grade_levels,id',
            'subject_id' => 'required|exists:subjects,id',
            'is_compulsory' => 'boolean',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if already assigned
        $existing = GradeLevelSubject::where('school_id', $user->school_id)
            ->where('grade_level_id', $request->grade_level_id)
            ->where('subject_id', $request->subject_id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Subject is already assigned to this grade level.',
            ], 409);
        }

        $mapping = GradeLevelSubject::create([
            'school_id' => $user->school_id,
            'grade_level_id' => $request->grade_level_id,
            'subject_id' => $request->subject_id,
            'is_compulsory' => $request->is_compulsory ?? true,
            'department_id' => $request->department_id,
        ]);

        return response()->json([
            'message' => 'Subject assigned to grade level successfully',
            'mapping' => $mapping,
        ], 201);
    }

    /**
     * Bulk assign subjects to multiple grade levels.
     */
    public function bulkAssignSubjects(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'grade_level_ids' => 'required|array|min:1',
            'grade_level_ids.*' => 'exists:grade_levels,id',
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
            'is_compulsory' => 'boolean',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $created = 0;
            foreach ($request->grade_level_ids as $gradeLevelId) {
                foreach ($request->subject_ids as $subjectId) {
                    // Skip if already assigned
                    $exists = GradeLevelSubject::where('school_id', $user->school_id)
                        ->where('grade_level_id', $gradeLevelId)
                        ->where('subject_id', $subjectId)
                        ->exists();
                    
                    if (!$exists) {
                        GradeLevelSubject::create([
                            'school_id' => $user->school_id,
                            'grade_level_id' => $gradeLevelId,
                            'subject_id' => $subjectId,
                            'is_compulsory' => $request->is_compulsory ?? true,
                            'department_id' => $request->department_id,
                        ]);
                        $created++;
                    }
                }
            }

            return response()->json([
                'message' => "Assigned {$created} subject(s) to " . count($request->grade_level_ids) . " grade level(s)",
                'created_count' => $created,
            ], 201);
        });
    }

    /**
     * Remove a subject from a grade level.
     */
    public function removeSubjectFromGrade(Request $request, int $mappingId): JsonResponse
    {
        $user = $request->user();
        $mapping = GradeLevelSubject::where('school_id', $user->school_id)->findOrFail($mappingId);

        $mapping->delete();

        return response()->json(['message' => 'Subject removed from grade level']);
    }

    /**
     * Delete CA week configuration for a specific grade + subject + term.
     */
    public function deleteCaWeeks(Request $request, int $termId, int $gradeLevelId, int $subjectId): JsonResponse
    {
        $user = $request->user();
        
        $deleted = CaWeek::where('school_id', $user->school_id)
            ->where('term_id', $termId)
            ->where('grade_level_id', $gradeLevelId)
            ->where('subject_id', $subjectId)
            ->delete();

        return response()->json(['message' => "CA configuration deleted successfully ($deleted records removed)"]);
    }
}
