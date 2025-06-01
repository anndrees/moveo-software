<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('mantenimientos', function (Blueprint $table) {
            $table->string('responsable')->default('Sistema');
        });
    }

    public function down()
    {
        Schema::table('mantenimientos', function (Blueprint $table) {
            $table->dropColumn('responsable');
        });
    }
};
