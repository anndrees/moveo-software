<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class SimpleUserSeeder extends Seeder
{
    public function run()
    {
        // Crear un solo usuario administrador simple
        User::create([
            'nombre' => 'Admin Simple',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'rol' => 'admin',
            'email_verified_at' => now(),
        ]);
        
        $this->command->info('Usuario de prueba creado exitosamente!');
    }
}
