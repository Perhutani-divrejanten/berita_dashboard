<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beritas', function (Blueprint $table) {
            $table->id();

            // ===== Kolom match Google Sheets =====
            $table->string('slug', 220)->unique();
            $table->string('title', 255);
            $table->date('date');
            $table->string('category', 50)->index();
            $table->string('badge', 50)->nullable();
            $table->string('image', 500)->nullable();
            $table->string('excerpt', 500);
            $table->longText('content');
            $table->string('author', 100);

            // ===== Kolom sistem =====
            $table->boolean('is_published')->default(false)->index();
            $table->unsignedInteger('views')->default(0);
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            // ===== Timestamps & Soft Delete =====
            $table->timestamps();
            $table->softDeletes();

            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beritas');
    }
};