<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $fillable = [
        'cliente_id',
        'cliente_type',
        'vehiculo_id',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'precio_total',
    ];
    public function cliente()
    {
        return $this->morphTo();
    }
    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    //
}
