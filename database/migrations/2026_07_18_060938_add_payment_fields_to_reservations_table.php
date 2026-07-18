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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('payment_status')->default('pendiente');
            $table->string('payment_method')->nullable();
            $table->string('guarantee_status')->default('pendiente');
            $table->decimal('guarantee_amount', 10, 2)->default(0.00);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'payment_method', 'guarantee_status', 'guarantee_amount']);
        });
    }
};
