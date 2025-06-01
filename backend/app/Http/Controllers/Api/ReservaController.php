<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Reserva::with(['cliente', 'vehiculo']);
        
        // Aplicar filtros de búsqueda
        if ($request->has('matricula') && $request->matricula) {
            $query->whereHas('vehiculo', function($q) use ($request) {
                $q->where('matricula', 'like', '%' . $request->matricula . '%');
            });
        }
        
        if ($request->has('cliente') && $request->cliente) {
            $query->whereHas('cliente', function($q) use ($request) {
                $q->where('nombre', 'like', '%' . $request->cliente . '%')
                  ->orWhere('apellidos', 'like', '%' . $request->cliente . '%')
                  ->orWhere('email', 'like', '%' . $request->cliente . '%');
            });
        }
        
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }
        
        $reservas = $query->orderBy('created_at', 'desc')
                        ->paginate(12);
            
        // Formatear las fechas y asegurar que los datos estén en el formato correcto
        $hoy = \Carbon\Carbon::today();
        $reservas->getCollection()->transform(function ($reserva) use ($hoy) {
            // Cambiar estado si corresponde (no tocar pendiente ni cancelada)
            if (!in_array($reserva->estado, ['pendiente', 'cancelada'])) {
                $inicio = \Carbon\Carbon::parse($reserva->fecha_inicio);
                $fin = \Carbon\Carbon::parse($reserva->fecha_fin);
                $nuevoEstado = $reserva->estado;
                if ($hoy->lt($inicio)) {
                    $nuevoEstado = 'confirmada';
                } elseif ($hoy->gt($fin)) {
                    $nuevoEstado = 'finalizada';
                } elseif ($hoy->between($inicio, $fin)) {
                    $nuevoEstado = 'en_curso';
                }
                if ($nuevoEstado !== $reserva->estado) {
                    $reserva->estado = $nuevoEstado;
                    // Guardar solo si ha cambiado
                    $reserva->save();
                }
            }
            // Asegurar que las fechas estén en el formato correcto
            if ($reserva->fecha_inicio && is_string($reserva->fecha_inicio)) {
                $reserva->fecha_inicio = \Carbon\Carbon::parse($reserva->fecha_inicio)->format('Y-m-d');
            }
            if ($reserva->fecha_fin && is_string($reserva->fecha_fin)) {
                $reserva->fecha_fin = \Carbon\Carbon::parse($reserva->fecha_fin)->format('Y-m-d');
            }
            // Asegurar que los precios sean números
            if (isset($reserva->precio_total)) {
                $reserva->precio_total = (float) $reserva->precio_total;
            }
            // Asegurar que las relaciones estén presentes
            if ($reserva->cliente) {
                $reserva->cliente->nombre_completo = trim($reserva->cliente->nombre . ' ' . ($reserva->cliente->apellidos ?? ''));
            }
            if ($reserva->vehiculo) {
                $reserva->vehiculo->nombre_completo = trim(($reserva->vehiculo->marca ?? '') . ' ' . ($reserva->vehiculo->modelo ?? ''));
                if ($reserva->vehiculo->imagen) {
                    $reserva->vehiculo->imagen = asset('storage/' . $reserva->vehiculo->imagen);
                }
            }
            return $reserva;
        });
        
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
                'precio_total' => $peticion->input('precio_total'),
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
        try {
            $reserva = \App\Models\Reserva::findOrFail($id);
            $reserva->delete();
            
            return response()->json([
                'mensaje' => 'Reserva eliminada exitosamente',
                'id' => $id
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'mensaje' => 'No se encontró la reserva especificada',
                'error' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al eliminar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancela una reserva específica.
     *
     * @param int $id ID de la reserva a cancelar
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelar($id)
    {
        try {
            // Buscar la reserva o devolver 404 si no existe
            $reserva = \App\Models\Reserva::findOrFail($id);
            
            // Verificar si la reserva ya está cancelada
            if ($reserva->estado === 'cancelada') {
                return response()->json([
                    'mensaje' => 'La reserva ya está cancelada',
                    'reserva' => $reserva
                ], 200);
            }
            
            // Actualizar el estado de la reserva a 'cancelada'
            $reserva->estado = 'cancelada';
            $reserva->save();
            
            // Cargar las relaciones para la respuesta
            $reserva->load(['cliente', 'vehiculo']);
            
            return response()->json([
                'mensaje' => 'Reserva cancelada exitosamente',
                'reserva' => $reserva
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'mensaje' => 'No se encontró la reserva especificada',
                'error' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al cancelar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Marca una reserva como finalizada.
     *
     * @param int $id ID de la reserva a finalizar
     * @return \Illuminate\Http\JsonResponse
     */
    public function finalizar($id)
    {
        try {
            // Buscar la reserva o devolver 404 si no existe
            $reserva = \App\Models\Reserva::findOrFail($id);
            
            // Verificar si la reserva ya está finalizada
            if ($reserva->estado === 'finalizada') {
                return response()->json([
                    'mensaje' => 'La reserva ya está finalizada',
                    'reserva' => $reserva
                ], 200);
            }
            
            // Actualizar el estado de la reserva a 'finalizada'
            $reserva->estado = 'finalizada';
            $reserva->save();
            
            // Cargar las relaciones para la respuesta
            $reserva->load(['cliente', 'vehiculo']);
            
            return response()->json([
                'mensaje' => 'Reserva marcada como finalizada exitosamente',
                'reserva' => $reserva
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'mensaje' => 'No se encontró la reserva especificada',
                'error' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al finalizar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
