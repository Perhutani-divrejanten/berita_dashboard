<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategoris', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 50)->unique();
            $table->string('slug', 60)->unique();
            $table->string('deskripsi', 255)->nullable();
            $table->string('warna', 20)->default('indigo'); // untuk badge
            $table->boolean('is_active')->default(true)->index();
            $table->integer('urutan')->default(0)->index(); // untuk sorting manual
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kategoris');
    }
};
