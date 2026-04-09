<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ui_illustrations', function (Blueprint $table) {
            $table->id();
            $table->string('pack_name'); // e.g., "Fresh Start 2026"
            $table->string('key'); // e.g., "login_hero", "signup_welcome"
            $table->string('url');
            $table->string('section'); // login, signup, dashboard, errors, empty_states
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['key', 'is_active']);
            $table->index(['section', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ui_illustrations');
    }
};
