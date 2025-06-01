<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Vehiculo extends Model
{
    use SoftDeletes;
    
    /**
     * Nombre de la tabla en la base de datos.
     *
     * @var string
     */
    protected $table = 'vehiculos';
    
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'marca',
        'modelo',
        'anio',
        'matricula',
        'kilometraje',
        'precio_dia',
        'descripcion',
        'caracteristicas',
        'color',
        'tipo_combustible',
        'capacidad_pasajeros',
        'capacidad_maletero',
        'tipo_caja',
        'aire_acondicionado',
        'disponible',
        'foto_principal',
        'fotos_adicionales',
        'fecha_ultimo_mantenimiento',
        'proximo_mantenimiento_km',
        'estado',
        'imagen', // <-- Añadido para permitir la actualización
    ];

    /**
     * Obtiene los daños reportados para este vehículo.
     */
    public function danos()
    {
        return $this->hasMany(DanoVehiculo::class);
    }

    /**
     * Los atributos que deben ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'aire_acondicionado' => 'boolean',
        'disponible' => 'boolean',
        'fecha_ultimo_mantenimiento' => 'date',
        'fotos_adicionales' => 'array',
        'precio_dia' => 'float',
        'kilometraje' => 'integer',
        'anio' => 'integer',
        'capacidad_pasajeros' => 'integer',
        'proximo_mantenimiento_km' => 'integer',
    ];

    /**
     * Los atributos que deben ser convertidos a fechas.
     *
     * @var array<string>
     */
    protected $dates = [
        'fecha_ultimo_mantenimiento',
        'deleted_at',
    ];

    /**
     * Obtener las reservas del vehículo.
     */
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'vehiculo_id');
    }

    /**
     * Obtener los mantenimientos del vehículo.
     */
    public function mantenimientos(): HasMany
    {
        return $this->hasMany(Mantenimiento::class);
    }

    /**
     * Verificar si el vehículo está disponible para un rango de fechas.
     */
    public function estaDisponible($fechaInicio, $fechaFin): bool
    {
        return !$this->reservas()
            ->where(function ($query) use ($fechaInicio, $fechaFin) {
                $query->whereBetween('fecha_inicio', [$fechaInicio, $fechaFin])
                      ->orWhereBetween('fecha_fin', [$fechaInicio, $fechaFin])
                      ->orWhere(function ($query) use ($fechaInicio, $fechaFin) {
                          $query->where('fecha_inicio', '<=', $fechaInicio)
                                ->where('fecha_fin', '>=', $fechaFin);
                      });
            })
            ->whereIn('estado', ['pendiente', 'confirmada', 'en_curso'])
            ->exists();
    }

    /**
     * Obtener el próximo mantenimiento programado.
     */
    public function proximoMantenimiento()
    {
        return $this->mantenimientos()
            ->where('estado', 'programado')
            ->orderBy('fecha_programada')
            ->first();
    }

    /**
     * Obtener el último mantenimiento realizado.
     */
    public function ultimoMantenimiento()
    {
        return $this->mantenimientos()
            ->where('estado', 'completado')
            ->latest('fecha_realizacion')
            ->first();
    }

    /**
     * Obtener la URL de la imagen principal.
     */
    public function getFotoPrincipalUrlAttribute()
    {
        return $this->foto_principal ? asset('storage/' . $this->foto_principal) : asset('img/vehiculo-default.jpg');
    }

    /**
     * Obtener las URLs de las fotos adicionales.
     */
    public function getFotosAdicionalesUrlsAttribute()
    {
        if (empty($this->fotos_adicionales)) {
            return [];
        }

        return array_map(function ($foto) {
            return asset('storage/' . $foto);
        }, $this->fotos_adicionales);
    }
}
