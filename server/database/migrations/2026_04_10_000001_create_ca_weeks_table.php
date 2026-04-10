<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * CA Weeks table defines which weeks in a term have continuous assessment tests
     * and which week is the final exam week for a specific grade + subject combination.
     */
    public function up(): void
    {
        Schema::create('ca_weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained('academic_terms')->onDelete('cascade');
            $table->foreignId('grade_level_id')->constrained('grade_levels')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->integer('week_number'); // e.g., Week 1-12
            $table->boolean('is_test_week')->default(false); // This week has a CA test
            $table->boolean('is_exam_week')->default(false); // This week is the final exam
            $table->timestamps();

            // Ensure no duplicate week entries for same grade+subject+term+week
            $table->unique(['term_id', 'grade_level_id', 'subject_id', 'week_number']);
            
            // Index for fast filtering
            $table->index(['grade_level_id', 'subject_id', 'term_id']);
            $table->index('is_test_week');
            $table->index('is_exam_week');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ca_weeks');
    }
};
