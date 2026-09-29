<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sheet_berita_revisions', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 220)->index();
            $table->string('action', 20);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('snapshot')->nullable();
            $table->json('changes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['slug', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sheet_berita_revisions');
    }
};
