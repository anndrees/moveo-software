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
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
$table->unsignedBigInteger('cliente_id');
$table->string('cliente_type');
$table->foreignId('vehiculo_id')->constrained('vehiculos')->onDelete('cascade');
$table->date('fecha_inicio');
$table->date('fecha_fin');
$table->enum('estado', ['pendiente', 'confirmada', 'en_curso', 'cancelada', 'finalizada'])->default('pendiente');
$table->decimal('precio_total', 10, 2);
$table->decimal('deposito', 10, 2)->default(0);
$table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia'])->default('tarjeta');
$table->text('observaciones')->nullable();
$table->string('seguro')->default('básico'); // básico, completo, premium
$table->boolean('conductor_adicional')->default(false);
$table->boolean('silla_bebe')->default(false);
$table->boolean('gps')->default(false);
$table->timestamps();
$table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
