<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('beritas', function (Blueprint $table): void {
            $table->timestamp('publish_at')->nullable()->after('date')->index();
        });
    }

    public function down(): void
    {
        Schema::table('beritas', function (Blueprint $table): void {
            $table->dropColumn('publish_at');
        });
    }
};
