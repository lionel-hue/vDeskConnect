<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class School extends Model
{
    protected $fillable = [
        'name',
        'country',
        'timezone',
        'currency',
        'logo_url',
        'config',
        'active',
    ];

    protected $casts = [
        'config' => 'array',
        'active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->latest();
    }

    // Academic relationships
    public function academicSessions(): HasMany
    {
        return $this->hasMany(AcademicSession::class);
    }

    public function activeSession()
    {
        return $this->hasOne(AcademicSession::class)->where('active', true);
    }

    public function academicTerms(): HasMany
    {
        return $this->hasMany(AcademicTerm::class);
    }

    public function gradeScales(): HasMany
    {
        return $this->hasMany(GradeScale::class);
    }

    public function defaultGradeScale()
    {
        return $this->hasOne(GradeScale::class)->where('is_default', true);
    }

    public function caWeeks(): HasMany
    {
        return $this->hasMany(CaWeek::class);
    }
}
