<?php

namespace Database\Seeders;

use App\Models\Vehiculo;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;

class VehiculosPruebaSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('es_ES');
        
        // Marcas y modelos reales de vehículos
        $marcasModelos = [
            'Toyota' => [
                'Corolla' => 'Sedan',
                'RAV4' => 'SUV',
                'Hilux' => 'Pickup',
                'Yaris' => 'Compact',
                'Camry' => 'Sedan',
            ],
            'Volkswagen' => [
                'Golf' => 'Compact',
                'Tiguan' => 'SUV',
                'Passat' => 'Sedan',
                'Polo' => 'Economy',
                'Arteon' => 'Luxury',
            ],
            'BMW' => [
                'Serie 3' => 'Sedan',
                'X3' => 'SUV',
                'Serie 5' => 'Luxury',
                'X5' => 'SUV',
                'Serie 1' => 'Compact',
            ],
            'Mercedes' => [
                'Clase A' => 'Compact',
                'Clase C' => 'Sedan',
                'GLC' => 'SUV',
                'Clase E' => 'Luxury',
                'GLA' => 'SUV',
            ],
            'Audi' => [
                'A3' => 'Compact',
                'A4' => 'Sedan',
                'Q5' => 'SUV',
                'A6' => 'Luxury',
                'Q3' => 'SUV',
            ],
            'Ford' => [
                'Focus' => 'Compact',
                'Kuga' => 'SUV',
                'Mustang' => 'Convertible',
                'Ranger' => 'Pickup',
                'Fiesta' => 'Economy',
            ],
        ];

        $colores = ['Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde', 'Marrón'];
        $ciudades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Zaragoza'];
        $combustibles = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'Híbrido enchufable'];
        $transmisiones = ['Automático', 'Manual'];

        $vehiculos = [];
        $i = 1;
        
        foreach ($marcasModelos as $marca => $modelos) {
            foreach ($modelos as $modelo => $tipo) {
                // Determinar precio por día según el tipo de vehículo
                $precios = [
                    'Economy' => 25,
                    'Compact' => 35,
                    'Sedan' => 45,
                    'SUV' => 60,
                    'Luxury' => 90,
                    'Pickup' => 70,
                    'Convertible' => 80,
                ];
                
                $precioBase = $precios[$tipo] ?? 40;
                $precioDia = $faker->numberBetween($precioBase * 0.8, $precioBase * 1.2);
                
                $vehiculos[] = [
                    'matricula' => strtoupper($faker->bothify('####' . $faker->randomLetter . $faker->randomLetter . $faker->randomLetter)),
                    'modelo' => "$marca $modelo", // Combinamos marca y modelo en un solo campo
                    'tipo' => $tipo,
                    'color' => $faker->randomElement($colores),
                    'kilometraje' => $faker->numberBetween(1000, 100000),
                    'precio_dia' => $precioDia,
                    'localizacion' => $faker->randomElement($ciudades),
                    'estado' => $faker->randomElement(['disponible', 'disponible', 'disponible', 'ocupado', 'mantenimiento']),
                    'descripcion' => $faker->paragraph(3),
                    'caracteristicas' => json_encode([
                        'marca' => $marca,
                        'modelo' => $modelo,
                        'combustible' => $faker->randomElement($combustibles),
                        'transmision' => $faker->randomElement($transmisiones),
                        'aire_acondicionado' => true,
                        'gps' => $faker->boolean(70),
                        'bluetooth' => true,
                        'asientos_cuero' => $tipo === 'Luxury' ? true : $faker->boolean(30),
                        'camara_trasera' => $faker->boolean(70),
                        'sensor_estacionamiento' => $faker->boolean(60),
                        'control_velocidad' => $faker->boolean(80),
                        'usb' => true,
                        'cierre_centralizado' => true,
                        'alarma' => $faker->boolean(90),
                    ]),
                    'fecha_proximo_mantenimiento' => $faker->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                // Limitar a 20 vehículos para no excedernos
                if ($i++ >= 20) break 2;
            }
        }
        
        // Insertar todos los vehículos
        Vehiculo::insert($vehiculos);
        
        // Actualizar las imágenes de los vehículos
        $this->actualizarImagenesVehiculos();
    }
    
    private function actualizarImagenesVehiculos()
    {
        // Obtener todos los vehículos
        $vehiculos = Vehiculo::all();
        
        // Ruta base para las imágenes de vehículos
        $rutaBase = 'vehiculos/';
        
        // Actualizar cada vehículo con una imagen aleatoria
        foreach ($vehiculos as $vehiculo) {
            // Extraer la marca del modelo (asumiendo que está en el formato "Marca Modelo")
            $partesModelo = explode(' ', $vehiculo->modelo, 2);
            $marca = $partesModelo[0];
            $modelo = $partesModelo[1] ?? '';
            
            $imagen = 'vehiculo-' . strtolower(str_replace(' ', '-', $marca)) . '-' . 
                     strtolower(str_replace(' ', '-', $modelo)) . '.jpg';
            
            // Verificar si la imagen existe en la carpeta de imágenes
            $rutaImagen = public_path('images/' . $rutaBase . $imagen);
            
            // Si no existe, usar una imagen por defecto
            if (!file_exists($rutaImagen)) {
                $imagen = 'vehiculo-default.jpg';
            }
            
            $vehiculo->update(['imagen' => $rutaBase . $imagen]);
        }
    }
}
