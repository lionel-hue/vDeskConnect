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
                $table->string('title')->after('section_id')->default('');
            }
            if (!Schema::hasColumn('lectures', 'description')) {
                $table->text('description')->after('title')->nullable();
            }
            if (!Schema::hasColumn('lectures', 'is_online')) {
                $table->boolean('is_online')->default(false)->after('status');
            }
            if (!Schema::hasColumn('lectures', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('meeting_link')->constrained('users')->onDelete('set null');
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