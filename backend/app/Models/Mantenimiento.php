<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mantenimiento extends Model
{
    protected $fillable = [
        'vehiculo_id',
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'tipo',
        'prioridad',
        'costo',
        'estado',
        'taller',
        'factura_numero',
        'responsable',
        'kilometraje',
        'observaciones',
        'mano_obra',
        'materiales',
        'realizado_por',
        'documentos',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }
}
