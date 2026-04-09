<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Make school_id nullable for Super Admin (who doesn't belong to a specific school)
        DB::statement('ALTER TABLE users ALTER COLUMN school_id DROP NOT NULL');
        DB::statement('ALTER TABLE users ADD CONSTRAINT users_school_id_foreign FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        // Revert: make school_id required again (this won't work if super_admin exists with null school_id)
        DB::statement('ALTER TABLE users ALTER COLUMN school_id SET NOT NULL');
    }
};
