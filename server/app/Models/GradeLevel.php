<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradeLevel extends Model
{
    protected $table = 'grade_levels';

    protected $fillable = [
        'school_id',
        'name',
        'short_name',
        'order',
        'cycle',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'grade_level_id');
    }

    public function caWeeks(): HasMany
    {
        return $this->hasMany(CaWeek::class, 'grade_level_id');
    }

    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
