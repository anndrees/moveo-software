<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'telefono',
        'documento_identidad',
        'direccion',
        'numero_carnet',
        'fecha_caducidad_carnet',
        'foto_perfil',
    ];
    public function reservas()
    {
        return $this->morphMany(\App\Models\Reserva::class, 'cliente');
    }

    //
}
