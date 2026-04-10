<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeLevelSubject extends Model
{
    protected $table = 'grade_level_subjects';

    protected $fillable = [
        'school_id',
        'grade_level_id',
        'subject_id',
        'is_compulsory',
        'department_id',
    ];

    protected $casts = [
        'is_compulsory' => 'boolean',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeForGrade($query, $gradeLevelId)
    {
        return $query->where('grade_level_id', $gradeLevelId);
    }

    public function scopeForSubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeCompulsory($query)
    {
        return $query->where('is_compulsory', true);
    }
}
