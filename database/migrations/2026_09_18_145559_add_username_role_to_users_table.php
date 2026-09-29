<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('id');
            $table->enum('role', ['admin', 'editor', 'user'])
                  ->default('user')
                  ->after('password');
            $table->tinyInteger('is_active')->default(1)->after('role');
            $table->timestamp('last_login')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'role', 'is_active', 'last_login']);
        });
    }
};
