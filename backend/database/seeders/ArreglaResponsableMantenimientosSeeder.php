<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArreglaResponsableMantenimientosSeeder extends Seeder
{
    public function run()
    {
        DB::table('mantenimientos')->whereNull('responsable')->update(['responsable' => 'Sistema']);
    }
}
