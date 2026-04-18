<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LectureResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecture_id',
        'type',
        'url',
        'title',
        'description',
        'uploaded_by',
        'is_downloadable',
        'is_savable',
        'available_from',
        'order_index',
    ];

    protected $casts = [
        'available_from' => 'datetime',
        'is_downloadable' => 'boolean',
        'is_savable' => 'boolean',
    ];

    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}