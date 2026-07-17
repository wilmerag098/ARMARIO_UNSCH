<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->nullable()->after('name');
            $table->string('dni')->nullable()->after('last_name');
            $table->string('position')->nullable()->after('dni');
            $table->string('profile_photo_path')->nullable()->after('position');
            $table->string('language')->default('es')->after('profile_photo_path');
            $table->string('panel_theme')->default('light')->after('language');
            $table->string('timezone')->default('America/Lima')->after('panel_theme');
            $table->string('date_format')->default('DD/MM/YYYY')->after('timezone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_name',
                'dni',
                'position',
                'profile_photo_path',
                'language',
                'panel_theme',
                'timezone',
                'date_format'
            ]);
        });
    }
};
