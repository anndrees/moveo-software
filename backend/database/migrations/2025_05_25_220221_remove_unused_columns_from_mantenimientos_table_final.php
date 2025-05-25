<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Intentar eliminar las columnas si existen
        Schema::table('mantenimientos', function (Blueprint $table) {
            $columns = ['responsable', 'mano_obra', 'materiales', 'prioridad', 'realizado_por'];
            
            // SQLite no permite eliminar múltiples columnas en una sola operación
            // así que necesitamos usar try-catch para cada columna
            foreach ($columns as $column) {
                if (Schema::hasColumn('mantenimientos', $column)) {
                    try {
                        $table->dropColumn($column);
                    } catch (\Exception $e) {
                        // Ignorar errores de columna no existente
                        if (strpos($e->getMessage(), 'no such column') === false) {
                            throw $e;
                        }
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Añadir las columnas eliminadas en caso de rollback
        Schema::table('mantenimientos', function (Blueprint $table) {
            if (!Schema::hasColumn('mantenimientos', 'responsable')) {
                $table->string('responsable')->after('factura_numero');
            }
            if (!Schema::hasColumn('mantenimientos', 'mano_obra')) {
                $table->decimal('mano_obra', 10, 2)->default(0)->after('estado');
            }
            if (!Schema::hasColumn('mantenimientos', 'materiales')) {
                $table->decimal('materiales', 10, 2)->default(0)->after('mano_obra');
            }
            if (!Schema::hasColumn('mantenimientos', 'prioridad')) {
                $table->enum('prioridad', ['baja', 'media', 'alta'])->default('media')->after('tipo');
            }
            if (!Schema::hasColumn('mantenimientos', 'realizado_por')) {
                $table->string('realizado_por')->nullable()->after('estado');
            }
        });
    }
};
