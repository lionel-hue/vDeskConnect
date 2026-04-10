<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Pivot table linking subjects to grade levels.
     * Defines which subjects are taught in which grade levels.
     */
    public function up(): void
    {
        Schema::create('grade_level_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('grade_level_id')->constrained('grade_levels')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->boolean('is_compulsory')->default(true); // Whether all students in this grade must take it
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null'); // For departmental subjects
            $table->timestamps();

            // Ensure no duplicate subject-grade combinations
            $table->unique(['grade_level_id', 'subject_id']);
            
            // Indexes for fast lookups
            $table->index('grade_level_id');
            $table->index('subject_id');
            $table->index('is_compulsory');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grade_level_subjects');
    }
};
