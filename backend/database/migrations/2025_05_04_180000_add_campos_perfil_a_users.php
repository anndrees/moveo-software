<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('direccion')->nullable();
            $table->string('numero_carnet')->nullable();
            $table->date('fecha_caducidad_carnet')->nullable();
            $table->string('foto_perfil')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['direccion', 'numero_carnet', 'fecha_caducidad_carnet', 'foto_perfil']);
        });
    }
};
