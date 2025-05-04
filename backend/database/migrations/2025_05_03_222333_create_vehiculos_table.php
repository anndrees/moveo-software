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
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
$table->string('matricula')->unique();
$table->string('modelo');
$table->enum('tipo', ['SUV', 'Economy', 'Luxury', 'Compact', 'Sedan', 'Convertible', 'Pickup', 'Van', 'Otro'])->default('SUV');
$table->string('imagen')->nullable();
$table->string('localizacion');
$table->enum('estado', ['disponible', 'ocupado', 'mantenimiento'])->default('disponible');
$table->date('fecha_proximo_mantenimiento')->nullable();
$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
