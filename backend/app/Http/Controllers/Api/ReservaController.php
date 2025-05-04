<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function index()
    {
        $reservas = \App\Models\Reserva::with(['cliente', 'vehiculo'])->get();
        return response()->json($reservas);
    }

    public function store(Request $peticion)
    {
        try {
            // Determina el tipo de cliente antes de validar
            $cliente_id = $peticion->input('cliente_id');
// Si el cliente_id viene como 'C2', lo convertimos a 2
if (is_string($cliente_id) && preg_match('/^C(\d+)$/', $cliente_id, $coincidencias)) {
    $cliente_id = intval($coincidencias[1]);
    // Actualiza el input para el validador y el resto del proceso
    $peticion->merge(['cliente_id' => $cliente_id]);
}
$tipoCliente = null;
            if ($cliente_id) {
                if (\App\Models\Cliente::where('id', $cliente_id)->exists()) {
                    $tipoCliente = \App\Models\Cliente::class;
                } elseif (\App\Models\User::where('id', $cliente_id)->exists()) {
                    $tipoCliente = \App\Models\User::class;
                }
            }
            if (!$tipoCliente) {
                return response()->json([
                    'mensaje' => 'Error de validación',
                    'errores' => ['cliente_id' => ['El cliente seleccionado no es válido.']]
                ], 422);
            }
            $datos = $peticion->validate([
                'cliente_id' => [
    'required',
    function($attribute, $value, $fail) {
        $existeCliente = \App\Models\Cliente::where('id', $value)->exists();
        $existeUsuario = \App\Models\User::where('id', $value)->exists();
        if (!$existeCliente && !$existeUsuario) {
            $fail('El cliente seleccionado no es válido.');
        }
    }
],
                'vehiculo_id' => 'required|exists:vehiculos,id',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'estado' => 'required|in:pendiente,confirmada,cancelada,finalizada',
            ]);
            $reserva = \App\Models\Reserva::create([
                'cliente_id' => $datos['cliente_id'],
                'cliente_type' => $tipoCliente,
                'vehiculo_id' => $datos['vehiculo_id'],
                'fecha_inicio' => $datos['fecha_inicio'],
                'fecha_fin' => $datos['fecha_fin'],
                'estado' => $datos['estado'],
            ]);
            return response()->json($reserva, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al guardar reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $reserva = \App\Models\Reserva::with(['cliente', 'vehiculo'])->findOrFail($id);
        return response()->json($reserva);
    }

    public function update(Request $peticion, $id)
    {
        try {
            $reserva = \App\Models\Reserva::findOrFail($id);
            $tipoCliente = null;
$datos = $peticion->validate([
                'cliente_id' => [
    'required',
    function($attribute, $value, $fail) use (&$tipoCliente, &$peticion) {
        $existeCliente = \App\Models\Cliente::where('id', $value)->exists();
        $existeUsuario = \App\Models\User::where('id', $value)->exists();
        if (!$existeCliente && !$existeUsuario) {
            $fail('El ' . $attribute . ' no es válido.');
        }
        // Guardamos el tipo para el controlador
        $tipoCliente = $existeCliente ? \App\Models\Cliente::class : \App\Models\User::class;
$peticion->merge([
            'cliente_type' => $tipoCliente
        ]);
    }
],
                
                'vehiculo_id' => 'required|exists:vehiculos,id',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'estado' => 'required|in:pendiente,confirmada,cancelada,finalizada',
            ]);
            $reserva->update([
    'cliente_id' => $datos['cliente_id'],
    'cliente_type' => $datos['cliente_type'],
    'vehiculo_id' => $datos['vehiculo_id'],
    'fecha_inicio' => $datos['fecha_inicio'],
    'fecha_fin' => $datos['fecha_fin'],
    'estado' => $datos['estado'],
]);
            return response()->json($reserva);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al actualizar reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $reserva = \App\Models\Reserva::findOrFail($id);
        $reserva->delete();
        return response()->json(['mensaje' => 'Reserva eliminada']);
    }


}
