<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UiIllustration extends Model
{
    protected $fillable = [
        'pack_name',
        'key',
        'url',
        'section',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Activate this illustration pack, deactivating all others.
     */
    public function activate(): void
    {
        $this->getConnection()->transaction(function () {
            // Deactivate all illustrations in the same pack
            static::where('pack_name', $this->pack_name)->update(['is_active' => false]);
            // Deactivate all illustrations with the same key
            static::where('key', $this->key)->update(['is_active' => false]);
            // Activate this one
            $this->update(['is_active' => true]);
        });
    }

    /**
     * Get all active illustrations as a keyed collection.
     */
    public static function getActiveIllustrations(): array
    {
        return static::where('is_active', true)
            ->get()
            ->pluck('url', 'key')
            ->toArray();
    }
}
