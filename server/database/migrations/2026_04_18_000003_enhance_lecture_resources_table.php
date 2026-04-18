<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lecture_resources', function (Blueprint $table) {
            if (!Schema::hasColumn('lecture_resources', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (!Schema::hasColumn('lecture_resources', 'is_downloadable')) {
                $table->boolean('is_downloadable')->default(false)->after('description');
            }
            if (!Schema::hasColumn('lecture_resources', 'is_savable')) {
                $table->boolean('is_savable')->default(false)->after('is_downloadable');
            }
            if (!Schema::hasColumn('lecture_resources', 'available_from')) {
                $table->dateTime('available_from')->nullable()->after('is_savable');
            }
            if (!Schema::hasColumn('lecture_resources', 'order_index')) {
                $table->integer('order_index')->default(0)->after('available_from');
            }
        });

        Schema::table('lectures', function (Blueprint $table) {
            if (!Schema::hasColumn('lectures', 'type')) {
                $table->enum('type', ['sync', 'async', 'hybrid'])->default('async')->after('status');
            }
            if (!Schema::hasColumn('lectures', 'async_available_after')) {
                $table->dateTime('async_available_after')->nullable()->after('type');
            }
            if (!Schema::hasColumn('lectures', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('async_available_after');
            }
            if (!Schema::hasColumn('lectures', 'content')) {
                $table->longText('content')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lectures', function (Blueprint $table) {
            $table->dropColumn(['type', 'async_available_after', 'is_published', 'content']);
        });

        Schema::table('lecture_resources', function (Blueprint $table) {
            $table->dropColumn(['description', 'is_downloadable', 'is_savable', 'available_from', 'order_index']);
        });
    }
};