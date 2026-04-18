<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lectures', function (Blueprint $table) {
            if (!Schema::hasColumn('lectures', 'title')) {
                $table->string('title')->default('');
            }
            if (!Schema::hasColumn('lectures', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('lectures', 'section_id')) {
                $table->foreignId('section_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('lectures', 'is_online')) {
                $table->boolean('is_online')->default(false);
            }
            if (!Schema::hasColumn('lectures', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lectures', function (Blueprint $table) {
            $table->dropColumn(['title', 'description', 'is_online', 'created_by']);
        });
    }
};