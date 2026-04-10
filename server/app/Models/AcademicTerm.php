<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicTerm extends Model
{
    protected $table = 'academic_terms';

    protected $fillable = [
        'school_id',
        'session_id',
        'name',
        'start_date',
        'end_date',
        'order',
        'weeks_count',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'order' => 'integer',
        'weeks_count' => 'integer',
    ];

    // Relationships
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class, 'session_id');
    }

    public function caWeeks(): HasMany
    {
        return $this->hasMany(CaWeek::class, 'term_id');
    }

    // Scopes
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeForSession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
