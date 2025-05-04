<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $fillable = [
        'matricula',
        'modelo',
        'tipo',
        'imagen',
        'localizacion',
        'estado',
        'fecha_proximo_mantenimiento',
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
