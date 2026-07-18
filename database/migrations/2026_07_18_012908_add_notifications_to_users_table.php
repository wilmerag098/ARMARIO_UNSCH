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
            $table->boolean('notify_reservations')->default(true)->after('date_format');
            $table->boolean('notify_returns')->default(true)->after('notify_reservations');
            $table->boolean('notify_system')->default(false)->after('notify_returns');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notify_reservations', 'notify_returns', 'notify_system']);
        });
    }
};
