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
        Schema::create('mantenimientos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehiculo_id');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->enum('tipo', ['revision', 'reparacion', 'mantenimiento', 'inspeccion', 'lavado', 'otro']);
            $table->enum('prioridad', ['baja', 'media', 'alta'])->default('media');
            $table->decimal('costo', 10, 2);
            $table->enum('estado', ['programado', 'en_progreso', 'completado', 'cancelado'])->default('programado');
            $table->string('taller')->nullable();
            $table->string('factura_numero')->nullable();
            $table->string('responsable');
            $table->integer('kilometraje')->nullable();
            $table->text('observaciones')->nullable();
            $table->json('documentos')->nullable(); // Para guardar rutas de archivos
            $table->decimal('mano_obra', 10, 2)->default(0);
            $table->decimal('materiales', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehiculo_id')->references('id')->on('vehiculos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mantenimientos');
    }
};
