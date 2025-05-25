<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;

class ClientesPruebaSeeder extends Seeder
{
  public function run()
  {
    $faker = Faker::create('es_ES');
    
    // Eliminar clientes existentes
    Cliente::truncate();

    // Crear 15 clientes de ejemplo con datos más realistas
    for ($i = 1; $i <= 15; $i++) {
      $fechaAleatoria = Carbon::now()->subDays(rand(1, 365));
      
      Cliente::create([
        'nombre' => $faker->firstName . ' ' . $faker->lastName,
        'apellidos' => $faker->lastName . ' ' . $faker->lastName,
        'email' => 'cliente' . $i . '@example.com',
        'telefono' => $faker->phoneNumber,
        'documento_identidad' => $faker->dni,
        'created_at' => $fechaAleatoria,
        'updated_at' => $fechaAleatoria,
      ]);
    }

    $this->command->info('15 clientes de ejemplo creados exitosamente con documentos de identidad y fechas aleatorias!');
  }
}
