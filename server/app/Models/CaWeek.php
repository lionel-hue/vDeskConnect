<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaWeek extends Model
{
    protected $table = 'ca_weeks';

    protected $fillable = [
        'school_id',
        'term_id',
        'grade_level_id',
        'subject_id',
        'week_number',
        'is_test_week',
        'is_exam_week',
    ];

    protected $casts = [
        'week_number' => 'integer',
        'is_test_week' => 'boolean',
        'is_exam_week' => 'boolean',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class, 'term_id');
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeForTerm($query, $termId)
    {
        return $query->where('term_id', $termId);
    }

    public function scopeForGrade($query, $gradeLevelId)
    {
        return $query->where('grade_level_id', $gradeLevelId);
    }

    public function scopeForSubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeTestWeeks($query)
    {
        return $query->where('is_test_week', true);
    }

    public function scopeExamWeeks($query)
    {
        return $query->where('is_exam_week', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('week_number');
    }
}
