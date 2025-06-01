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
        Schema::create('danos_vehiculo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehiculo_id')->constrained()->onDelete('cascade');
            $table->string('vista'); // 'frontal', 'trasera', 'lateral_izquierdo', 'lateral_derecho', 'superior'
            $table->integer('posicion_x'); // Posición X del daño en la imagen
            $table->integer('posicion_y'); // Posición Y del daño en la imagen
            $table->text('notas')->nullable(); // Notas opcionales sobre el daño
            $table->timestamps();
            
            // Índices para mejorar el rendimiento
            $table->index('vehiculo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('danos_vehiculo');
    }
};
