<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanoVehiculo;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DanoVehiculoController extends Controller
{
    /**
     * Obtener todos los daños de un vehículo
     *
     * @param  int  $vehiculoId
     * @return \Illuminate\Http\Response
     */
    public function index($vehiculoId)
    {
        $vehiculo = Vehiculo::findOrFail($vehiculoId);
        $danos = $vehiculo->danos;
        
        return response()->json([
            'success' => true,
            'data' => $danos
        ]);
    }

    /**
     * Almacenar un nuevo daño para un vehículo
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $vehiculoId
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $vehiculoId)
    {
        $vehiculo = Vehiculo::findOrFail($vehiculoId);
        
        $validator = Validator::make($request->all(), [
            'vista' => [
                'required',
                'string',
                Rule::in(DanoVehiculo::getVistasPermitidas())
            ],
            'posicion_x' => 'required|integer|min:0',
            'posicion_y' => 'required|integer|min:0',
            'notas' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $dano = new DanoVehiculo($validator->validated());
        $dano->vehiculo_id = $vehiculo->id;
        $dano->save();

        return response()->json([
            'success' => true,
            'data' => $dano,
            'message' => 'Daño registrado correctamente.'
        ], 201);
    }

    /**
     * Mostrar un daño específico
     *
     * @param  int  $vehiculoId
     * @param  int  $danoId
     * @return \Illuminate\Http\Response
     */
    public function show($vehiculoId, $danoId)
    {
        $dano = DanoVehiculo::where('vehiculo_id', $vehiculoId)
                          ->findOrFail($danoId);
        
        return response()->json([
            'success' => true,
            'data' => $dano
        ]);
    }

    /**
     * Eliminar un daño del vehículo
     *
     * @param  int  $vehiculoId
     * @param  int  $danoId
     * @return \Illuminate\Http\Response
     */
    public function destroy($vehiculoId, $danoId)
    {
        $dano = DanoVehiculo::where('vehiculo_id', $vehiculoId)
                          ->findOrFail($danoId);
        
        $dano->delete();

        return response()->json([
            'success' => true,
            'message' => 'Daño eliminado correctamente.'
        ]);
    }
}
