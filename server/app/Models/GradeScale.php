<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeScale extends Model
{
    protected $table = 'grade_scales';

    protected $fillable = [
        'school_id',
        'name',
        'scale',
        'is_default',
    ];

    protected $casts = [
        'scale' => 'array',
        'is_default' => 'boolean',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // Helper method to get grade for a score
    public function getGradeForScore(float $score): ?array
    {
        $scale = $this->scale;
        
        foreach ($scale as $grade => $range) {
            if ($score >= $range['min'] && $score <= $range['max']) {
                return [
                    'grade' => $grade,
                    'remark' => $range['remark'] ?? '',
                    'min' => $range['min'],
                    'max' => $range['max'],
                ];
            }
        }
        
        return null;
    }
}
