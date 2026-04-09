<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Just drop the NOT NULL constraint — foreign key already exists
        DB::statement('ALTER TABLE users ALTER COLUMN school_id DROP NOT NULL');
    }

    public function down(): void
    {
        // Revert to NOT NULL (will fail if super_admin rows exist with null school_id)
        DB::statement('ALTER TABLE users ALTER COLUMN school_id SET NOT NULL');
    }
};
