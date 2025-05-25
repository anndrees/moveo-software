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
        Schema::table('mantenimientos', function (Blueprint $table) {
            // Verificar si las columnas existen antes de intentar eliminarlas
            if (Schema::hasColumn('mantenimientos', 'responsable')) {
                $table->dropColumn('responsable');
            }
            if (Schema::hasColumn('mantenimientos', 'mano_obra')) {
                $table->dropColumn('mano_obra');
            }
            if (Schema::hasColumn('mantenimientos', 'materiales')) {
                $table->dropColumn('materiales');
            }
            if (Schema::hasColumn('mantenimientos', 'prioridad')) {
                $table->dropColumn('prioridad');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mantenimientos', function (Blueprint $table) {
            // Añadir las columnas eliminadas en caso de rollback
            if (!Schema::hasColumn('mantenimientos', 'responsable')) {
                $table->string('responsable');
            }
            if (!Schema::hasColumn('mantenimientos', 'mano_obra')) {
                $table->decimal('mano_obra', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('mantenimientos', 'materiales')) {
                $table->decimal('materiales', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('mantenimientos', 'prioridad')) {
                $table->enum('prioridad', ['baja', 'media', 'alta'])->default('media');
            }
        });
    }
};
