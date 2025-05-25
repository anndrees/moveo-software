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
    public function up()
    {
        // Crear una tabla temporal con la estructura deseada
        Schema::create('mantenimientos_temp', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehiculo_id');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->enum('tipo', ['revision', 'reparacion', 'mantenimiento', 'inspeccion', 'lavado', 'otro']);
            $table->decimal('costo', 10, 2);
            $table->enum('estado', ['programado', 'en_progreso', 'completado', 'cancelado'])->default('programado');
            $table->string('taller')->nullable();
            $table->string('factura_numero')->nullable();
            $table->integer('kilometraje')->nullable();
            $table->text('observaciones')->nullable();
            $table->json('documentos')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehiculo_id')->references('id')->on('vehiculos')->onDelete('cascade');
        });

        // Copiar datos de la tabla antigua a la nueva
        DB::statement('INSERT INTO mantenimientos_temp (id, vehiculo_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, costo, estado, taller, factura_numero, kilometraje, observaciones, documentos, created_at, updated_at, deleted_at) SELECT id, vehiculo_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, costo, estado, taller, factura_numero, kilometraje, observaciones, documentos, created_at, updated_at, deleted_at FROM mantenimientos');

        // Eliminar la tabla antigua
        Schema::drop('mantenimientos');

        // Renombrar la tabla temporal a mantenimientos
        Schema::rename('mantenimientos_temp', 'mantenimientos');
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Crear una tabla temporal con la estructura original
        Schema::create('mantenimientos_temp', function (Blueprint $table) {
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
            $table->json('documentos')->nullable();
            $table->decimal('mano_obra', 10, 2)->default(0);
            $table->decimal('materiales', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vehiculo_id')->references('id')->on('vehiculos')->onDelete('cascade');
        });

        // Copiar datos de la tabla actual a la temporal
        DB::statement('INSERT INTO mantenimientos_temp (id, vehiculo_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, costo, estado, taller, factura_numero, kilometraje, observaciones, documentos, created_at, updated_at, deleted_at) SELECT id, vehiculo_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, costo, estado, taller, factura_numero, kilometraje, observaciones, documentos, created_at, updated_at, deleted_at FROM mantenimientos');

        // Eliminar la tabla actual
        Schema::drop('mantenimientos');

        // Renombrar la tabla temporal a mantenimientos
        Schema::rename('mantenimientos_temp', 'mantenimientos');
    }
};
