<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->string('estado_nuevo')->default('disponible');
        });
        DB::statement('UPDATE vehiculos SET estado_nuevo = CASE estado WHEN "mantenimiento" THEN "en_mantenimiento" ELSE estado END');
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->renameColumn('estado_nuevo', 'estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            //
        });
    }
};
