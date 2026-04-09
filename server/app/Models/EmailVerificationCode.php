<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerificationCode extends Model
{
    protected $fillable = [
        'email',
        'code',
        'expires_at',
        'used',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
        'used_at' => 'datetime',
    ];

    /**
     * Generate a new 6-digit code for an email.
     */
    public static function generateFor(string $email): self
    {
        // Invalidate previous unused codes
        static::where('email', $email)->where('used', false)->delete();

        return static::create([
            'email' => $email,
            'code' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
            'expires_at' => now()->addMinutes(15),
        ]);
    }

    /**
     * Verify the code for the given email.
     */
    public static function verify(string $email, string $code): bool
    {
        $record = static::where('email', $email)
            ->where('code', $code)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($record) {
            $record->update(['used' => true, 'used_at' => now()]);
            return true;
        }

        return false;
    }
}
