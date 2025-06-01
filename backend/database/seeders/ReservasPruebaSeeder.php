<?php

namespace Database\Seeders;

use App\Models\Reserva;
use App\Models\Vehiculo;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;

class ReservasPruebaSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('es_ES');
        
        // Obtener todos los vehículos y clientes
        $vehiculos = Vehiculo::all();
        $clientes = Cliente::all();
        
        if ($vehiculos->isEmpty() || $clientes->isEmpty()) {
            $this->command->error('No hay suficientes vehículos o clientes para crear reservas.');
            return;
        }
        
        $reservas = [];
        $estados = ['pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada'];
        $metodosPago = ['efectivo', 'tarjeta', 'transferencia'];
        $seguros = ['básico', 'completo', 'premium'];
        
        // Crear 50 reservas de prueba
        for ($i = 0; $i < 50; $i++) {
            // Seleccionar un vehículo aleatorio
            $vehiculo = $vehiculos->random();
            
            // Seleccionar un cliente aleatorio de la tabla de clientes
            $cliente = $clientes->random();
            $clienteId = $cliente->id;
            $clienteType = 'App\\Models\\Cliente';
            
            // Fechas de reserva
            $fechaInicio = Carbon::instance($faker->dateTimeBetween('-6 months', '+3 months'));
            $diasReserva = $faker->numberBetween(1, 21); // Entre 1 y 21 días
            $fechaFin = (clone $fechaInicio)->addDays($diasReserva);
            
            // Determinar el estado de la reserva basado en las fechas
            $hoy = Carbon::now();
            $estado = '';
            
            if ($fechaFin < $hoy) {
                $estado = $faker->randomElement(['finalizada', 'finalizada', 'finalizada', 'cancelada']);
            } elseif ($fechaInicio <= $hoy && $fechaFin >= $hoy) {
                $estado = 'en_curso';
            } else {
                $estado = $faker->randomElement(['pendiente', 'confirmada', 'confirmada']);
            }
            
            // Calcular precio total
            $precioDia = $vehiculo->precio_dia;
            $dias = $fechaInicio->diffInDays($fechaFin);
            $precioBase = $precioDia * $dias;
            
            // Aplicar descuento aleatorio (0-20%)
            $descuento = $faker->boolean(30) ? $faker->numberBetween(5, 20) : 0;
            $precioConDescuento = $precioBase * (1 - ($descuento / 100));
            
            // Añadir extras
            $conductorAdicional = $faker->boolean(30);
            $sillaBebe = $faker->boolean(20);
            $gps = $faker->boolean(40);
            $seguro = $faker->randomElement($seguros);
            
            $extras = 0;
            if ($conductorAdicional) $extras += 10 * $dias;
            if ($sillaBebe) $extras += 5 * $dias;
            if ($gps) $extras += 3 * $dias;
            
            // Costo del seguro
            $costoSeguro = 0;
            switch ($seguro) {
                case 'básico':
                    $costoSeguro = 10 * $dias;
                    break;
                case 'completo':
                    $costoSeguro = 20 * $dias;
                    break;
                case 'premium':
                    $costoSeguro = 30 * $dias;
                    break;
            }
            
            $precioTotal = $precioConDescuento + $extras + $costoSeguro;
            
            // Depósito (30% del precio total)
            $deposito = $precioTotal * 0.3;
            
            $reserva = [
                'cliente_id' => $clienteId,
                'cliente_type' => $clienteType,
                'vehiculo_id' => $vehiculo->id,
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => $fechaFin->format('Y-m-d'),
                'estado' => $estado,
                'precio_total' => $precioTotal,
                'deposito' => $deposito,
                'metodo_pago' => $faker->randomElement($metodosPago),
                'observaciones' => $faker->boolean(30) ? $faker->sentence(10) : null,
                'seguro' => $seguro,
                'conductor_adicional' => $conductorAdicional,
                'silla_bebe' => $sillaBebe,
                'gps' => $gps,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            $reservas[] = $reserva;
        }
        
        // Insertar todas las reservas
        Reserva::insert($reservas);
        
        // Actualizar el estado de los vehículos según las reservas
        $this->actualizarEstadoVehiculos();
    }
    
    private function actualizarEstadoVehiculos()
    {
        $hoy = Carbon::now()->format('Y-m-d');
        
        // Obtener vehículos con reservas activas (en_curso o pendientes que empiezan hoy)
        $vehiculosConReservas = Vehiculo::whereHas('reservas', function($query) use ($hoy) {
            $query->where('estado', 'en_curso')
                  ->orWhere(function($q) use ($hoy) {
                      $q->where('estado', 'confirmada')
                        ->whereDate('fecha_inicio', '<=', $hoy)
                        ->whereDate('fecha_fin', '>=', $hoy);
                  });
        })->get();
        
        // Actualizar estado a 'alquilado' para vehículos con reservas activas
        foreach ($vehiculosConReservas as $vehiculo) {
            $vehiculo->estado = 'alquilado';
            $vehiculo->save();
        }
        
        // Actualizar vehículos sin reservas activas a 'disponible'
        Vehiculo::whereNotIn('id', $vehiculosConReservas->pluck('id'))
                ->update(['estado' => 'disponible']);
    }
}
