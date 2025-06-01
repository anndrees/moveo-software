<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehiculo;

class DanoVehiculo extends Model
{
    use HasFactory;

    protected $table = 'danos_vehiculo';

    protected $fillable = [
        'vehiculo_id',
        'vista',
        'posicion_x',
        'posicion_y',
        'notas'
    ];

    // Relación con el vehículo
    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    // Vistas permitidas
    public static function getVistasPermitidas()
    {
        return [
            'frontal',
            'trasera',
            'lateral_izquierdo',
            'lateral_derecho',
            'superior',
            'vista_completa'
        ];
    }
}
