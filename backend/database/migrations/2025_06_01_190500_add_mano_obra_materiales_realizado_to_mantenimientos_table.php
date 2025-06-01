<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('mantenimientos', function (Blueprint $table) {
            if (!Schema::hasColumn('mantenimientos', 'mano_obra')) {
                $table->decimal('mano_obra', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('mantenimientos', 'materiales')) {
                $table->decimal('materiales', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('mantenimientos', 'realizado_por')) {
                $table->string('realizado_por')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('mantenimientos', function (Blueprint $table) {
            if (Schema::hasColumn('mantenimientos', 'mano_obra')) {
                $table->dropColumn('mano_obra');
            }
            if (Schema::hasColumn('mantenimientos', 'materiales')) {
                $table->dropColumn('materiales');
            }
            if (Schema::hasColumn('mantenimientos', 'realizado_por')) {
                $table->dropColumn('realizado_por');
            }
        });
    }
};
