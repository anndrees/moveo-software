<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsuariosPruebaSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@moveo.com'],
            [
                'nombre' => 'Admin',
                'password' => Hash::make('password'),
                'rol' => 'admin',
            ]
        );
        User::updateOrCreate(
            ['email' => 'client@example.com'],
            [
                'nombre' => 'Cliente',
                'password' => Hash::make('password'),
                'rol' => 'cliente',
            ]
        );
    }
}
