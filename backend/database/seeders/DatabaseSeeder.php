<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cliente;
use App\Models\Vehiculo;
use App\Models\Reserva;
use App\Models\Mantenimiento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Carbon\Carbon;

// Importar las clases de los seeders
use Database\Seeders\UsuariosPruebaSeeder;
use Database\Seeders\VehiculosPruebaSeeder;
use Database\Seeders\ClientesPruebaSeeder;
use Database\Seeders\ReservasPruebaSeeder;
use Database\Seeders\MantenimientosPruebaSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $connection = DB::connection();
        $driver = $connection->getDriverName();
        
        // Desactivar la revisión de claves foráneas temporalmente
        if ($driver !== 'sqlite') {
            $connection->statement('SET FOREIGN_KEY_CHECKS=0');
        }
        
        // Limpiar tablas en el orden correcto para evitar errores de clave foránea
        $tables = [
            'mantenimientos',
            'reservas',
            'vehiculos',
            'clientes',
            'users'
        ];
        
        foreach ($tables as $table) {
            if ($driver === 'sqlite') {
                $connection->table($table)->delete();
            } else {
                $connection->table($table)->truncate();
            }
        }
        
        // Reactivar la revisión de claves foráneas
        if ($driver !== 'sqlite') {
            $connection->statement('SET FOREIGN_KEY_CHECKS=1');
        }
        
        // Ejecutar los seeders en el orden correcto
        $this->call([
            AdminUserSeeder::class,
            UsuariosPruebaSeeder::class,
            VehiculosPruebaSeeder::class,
            ClientesPruebaSeeder::class,
            ReservasPruebaSeeder::class,
            MantenimientosPruebaSeeder::class,
        ]);
    }
}
