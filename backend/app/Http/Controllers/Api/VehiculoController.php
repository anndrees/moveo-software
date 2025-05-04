<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class VehiculoController extends Controller
{
    public function index()
    {
        $vehiculos = \App\Models\Vehiculo::with('reservas')->get();
        // Añadir URL accesible para la imagen
        foreach ($vehiculos as $vehiculo) {
            if ($vehiculo->imagen) {
                $vehiculo->imagen = asset('storage/' . $vehiculo->imagen);
            }
        }
        return response()->json($vehiculos);
    }

    public function store(Request $peticion)
    {
        $datos = $peticion->validate([
            'matricula' => 'required|unique:vehiculos,matricula',
            'modelo' => 'required',
            'tipo' => 'required|in:SUV,Economy,Luxury,Compact,Sedan,Convertible,Pickup,Van,Otro',
            'localizacion' => 'required',
            'estado' => 'required|in:disponible,ocupado,en_mantenimiento,alquilado',
            'fecha_proximo_mantenimiento' => 'nullable|date',
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);
        if ($peticion->hasFile('imagen')) {
            $ruta = $peticion->file('imagen')->store('vehiculos', 'public');
            $datos['imagen'] = $ruta;
        }
        $vehiculo = \App\Models\Vehiculo::create($datos);
        // Devolver URL accesible
        if ($vehiculo->imagen) {
            $vehiculo->imagen = asset('storage/' . $vehiculo->imagen);
        }
        return response()->json($vehiculo, 201);
    }

    public function show($id)
    {
        $vehiculo = \App\Models\Vehiculo::with('reservas')->findOrFail($id);
        if ($vehiculo->imagen) {
            $vehiculo->imagen = asset('storage/' . $vehiculo->imagen);
        }
        return response()->json($vehiculo);
    }

    public function update(Request $peticion, $id)
    {
        $vehiculo = \App\Models\Vehiculo::findOrFail($id);
        $datos = $peticion->validate([
            'matricula' => 'required|unique:vehiculos,matricula,' . $vehiculo->id,
            'modelo' => 'required',
            'tipo' => 'required|in:SUV,Economy,Luxury,Compact,Sedan,Convertible,Pickup,Van,Otro',
            'localizacion' => 'required',
            'estado' => 'required|in:disponible,ocupado,en_mantenimiento,alquilado',
            'fecha_proximo_mantenimiento' => 'nullable|date',
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);
        if ($peticion->hasFile('imagen')) {
            // Eliminar imagen anterior si existe
            if ($vehiculo->imagen) {
                Storage::disk('public')->delete($vehiculo->imagen);
            }
            $ruta = $peticion->file('imagen')->store('vehiculos', 'public');
            $datos['imagen'] = $ruta;
        }
        $vehiculo->update($datos);
        // Devolver URL accesible
        if ($vehiculo->imagen) {
            $vehiculo->imagen = asset('storage/' . $vehiculo->imagen);
        }
        return response()->json($vehiculo);
    }

    public function destroy($id)
    {
        $vehiculo = \App\Models\Vehiculo::findOrFail($id);
        $vehiculo->delete();
        return response()->json(['mensaje' => 'Vehículo eliminado']);
    }


}
