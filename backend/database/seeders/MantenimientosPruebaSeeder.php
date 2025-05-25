<?php

namespace Database\Seeders;

use App\Models\Mantenimiento;
use App\Models\Vehiculo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;

class MantenimientosPruebaSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('es_ES');
        
        // Obtener vehículos y usuarios
        $vehiculos = Vehiculo::all();
        $usuarios = User::whereIn('rol', ['admin', 'empleado'])->get();
        
        if ($vehiculos->isEmpty() || $usuarios->isEmpty()) {
            $this->command->error('No hay suficientes vehículos o usuarios para crear mantenimientos.');
            return;
        }
        
        $mantenimientos = [];
        $tipos = ['revision', 'reparacion', 'mantenimiento', 'inspeccion', 'lavado', 'otro'];
        $estados = ['programado', 'en_progreso', 'completado', 'cancelado'];
        $talleres = ['Taller Central', 'Taller Norte', 'Taller Sur', 'Concesionario Oficial', 'Taller Externo'];

        
        // Crear 30 mantenimientos de prueba
        for ($i = 0; $i < 30; $i++) {
            $vehiculo = $vehiculos->random();
            $usuario = $usuarios->random();
            
            // Fechas del mantenimiento
            $fechaInicio = $faker->dateTimeBetween('-6 months', '+2 months');
            $duracionDias = $faker->numberBetween(1, 14); // Duración de 1 a 14 días
            $fechaFin = (clone $fechaInicio)->modify("+$duracionDias days");
            
            // Determinar el estado basado en las fechas
            $hoy = Carbon::now();
            $estado = '';
            
            if ($fechaFin < $hoy) {
                $estado = 'completado';
            } elseif ($fechaInicio <= $hoy && $fechaFin >= $hoy) {
                $estado = 'en_progreso';
            } else {
                $estado = 'programado';
            }
            
            // 10% de probabilidad de estar cancelado
            if ($faker->boolean(10)) {
                $estado = 'cancelado';
            }
            
            // Costo total
            $costoTotal = $faker->randomFloat(2, 50, 3000);
            
            // Documentos (simulados como JSON)
            $documentos = [];
            $numDocumentos = $faker->numberBetween(0, 3);
            for ($j = 0; $j < $numDocumentos; $j++) {
                $documentos[] = [
                    'nombre' => $faker->word . '.' . $faker->fileExtension,
                    'tipo' => $faker->randomElement(['factura', 'informe', 'foto', 'otro']),
                    'ruta' => 'documentos/mantenimientos/' . $faker->uuid . '.' . $faker->fileExtension,
                    'fecha' => $fechaInicio->format('Y-m-d')
                ];
            }
            
            $mantenimiento = [
                'vehiculo_id' => $vehiculo->id,
                'titulo' => $this->generarTituloMantenimiento($faker->randomElement($tipos), $vehiculo->marca, $vehiculo->modelo, $faker),
                'descripcion' => $faker->paragraph(3),
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => $fechaFin->format('Y-m-d'),
                'tipo' => $faker->randomElement($tipos),
                'costo' => $costoTotal,
                'estado' => $estado,
                'taller' => $faker->randomElement($talleres),
                'factura_numero' => $faker->boolean(70) ? 'FACT-' . $faker->numberBetween(1000, 9999) : null,
                'kilometraje' => $vehiculo->kilometraje + $faker->numberBetween(100, 5000),
                'observaciones' => $faker->boolean(60) ? $faker->paragraph(2) : null,
                'documentos' => !empty($documentos) ? json_encode($documentos) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            $mantenimientos[] = $mantenimiento;
        }
        
        // Insertar todos los mantenimientos
        Mantenimiento::insert($mantenimientos);
        
        // Actualizar el estado de los vehículos según los mantenimientos
        $this->actualizarEstadoVehiculos();
    }
    
    private function generarTituloMantenimiento($tipo, $marca, $modelo, $faker)
    {
        $tiposTitulos = [
            'revision' => [
                "Revisión periódica $marca $modelo",
                "Revisión de mantenimiento $marca $modelo",
                "Revisión técnica $marca $modelo"
            ],
            'reparacion' => [
                "Reparación de $marca $modelo",
                "Arreglo de " . $faker->randomElement(['motor', 'frenos', 'suspensión', 'transmisión']) . " $marca $modelo",
                "Reparación de avería en $marca $modelo"
            ],
            'mantenimiento' => [
                "Mantenimiento programado $marca $modelo",
                "Mantenimiento preventivo $marca $modelo",
                "Servicio de mantenimiento $marca $modelo"
            ],
            'inspeccion' => [
                "Inspección técnica $marca $modelo",
                "Revisión ITV $marca $modelo",
                "Inspección de seguridad $marca $modelo"
            ],
            'lavado' => [
                "Lavado y limpieza $marca $modelo",
                "Limpieza integral $marca $modelo",
                "Lavado completo $marca $modelo"
            ],
            'otro' => [
                "Servicio $marca $modelo",
                "Atención a $marca $modelo",
                "Intervención en $marca $modelo"
            ]
        ];
        
        return $faker->randomElement($tiposTitulos[$tipo]);
    }
    
    private function actualizarEstadoVehiculos()
    {
        $hoy = Carbon::now()->format('Y-m-d');
        
        // Obtener vehículos con mantenimiento en curso
        $vehiculosEnMantenimiento = Mantenimiento::where('fecha_inicio', '<=', $hoy)
            ->where('fecha_fin', '>=', $hoy)
            ->whereIn('estado', ['programado', 'en_progreso'])
            ->pluck('vehiculo_id')
            ->unique();
            
        // Actualizar vehículos a 'mantenimiento'
        Vehiculo::whereIn('id', $vehiculosEnMantenimiento)
            ->update(['estado' => 'mantenimiento']);
            
        // Actualizar fecha de próximo mantenimiento para vehículos que ya completaron mantenimiento
        $vehiculosConMantenimiento = Mantenimiento::where('estado', 'completado')
            ->orderBy('fecha_fin', 'desc')
            ->get()
            ->groupBy('vehiculo_id');
            
        foreach ($vehiculosConMantenimiento as $vehiculoId => $mantenimientos) {
            $ultimoMantenimiento = $mantenimientos->first();
            $proximoMantenimiento = Carbon::parse($ultimoMantenimiento->fecha_fin)
                ->addMonths(6) // Próximo mantenimiento en 6 meses
                ->format('Y-m-d');
                
            Vehiculo::where('id', $vehiculoId)
                ->update(['fecha_proximo_mantenimiento' => $proximoMantenimiento]);
        }
    }
}
