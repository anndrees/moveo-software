<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Faker\Factory as Faker;
use Carbon\Carbon;

class UsuariosPruebaSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('es_ES');
        
        // Usuarios administradores
        $admins = [
            [
                'nombre' => 'Carlos Mendoza',
                'email' => 'admin@moveo.com',
                'password' => Hash::make('password'),
                'rol' => 'admin',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Laura González',
                'email' => 'laura@moveo.com',
                'password' => Hash::make('password'),
                'rol' => 'admin',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        // Usuarios empleados
        $empleados = [];
        for ($i = 1; $i <= 5; $i++) {
            $empleados[] = [
                'nombre' => $faker->name,
                'email' => 'empleado' . $i . '@moveo.com',
                'password' => Hash::make('password'),
                'rol' => 'empleado',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Usuarios clientes
        $clientes = [];
        for ($i = 1; $i <= 15; $i++) {
            $clientes[] = [
                'nombre' => $faker->name,
                'email' => 'cliente' . $i . '@example.com',
                'password' => Hash::make('password'),
                'rol' => 'cliente',
                'email_verified_at' => now(),
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
                'updated_at' => now(),
            ];
        }

        // Insertar todos los usuarios
        User::insert(array_merge($admins, $empleados, $clientes));
    }
}
