<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country');
            $table->string('timezone')->default('UTC');
            $table->string('currency')->default('USD');
            $table->string('logo_url')->nullable();
            $table->json('config')->nullable(); // academic_labels, structure, exam_settings, localization
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};