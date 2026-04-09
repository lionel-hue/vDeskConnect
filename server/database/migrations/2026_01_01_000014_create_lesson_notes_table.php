<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('scheme_id')->constrained('schemes_of_work')->onDelete('cascade');
            $table->string('aspect')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('objective')->nullable();
            $table->text('content')->nullable();
            $table->string('methodology')->nullable();
            $table->text('evaluation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_notes');
    }
};
