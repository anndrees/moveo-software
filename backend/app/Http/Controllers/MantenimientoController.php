<?php

namespace App\Http\Controllers;

use App\Models\Mantenimiento;
use Illuminate\Http\Request;

class MantenimientoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Mantenimiento::with(['vehiculo']);
        
        // Aplicar filtros de búsqueda
        if ($request->has('matricula') && $request->matricula) {
            $query->whereHas('vehiculo', function($q) use ($request) {
                $q->where('matricula', 'like', '%' . $request->matricula . '%');
            });
        }
        
        if ($request->has('costo') && $request->costo) {
            $query->where('costo', '>=', (float)$request->costo * 0.9) // Busca valores cercanos (±10%)
                  ->where('costo', '<=', (float)$request->costo * 1.1);
        }
        
        // Buscar por taller
        if ($request->has('taller') && $request->taller) {
            $query->where('taller', 'like', '%' . $request->taller . '%');
        }
        
        // Filtrar por estado
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }
        
        // Filtrar por tipo de mantenimiento
        if ($request->has('tipo') && $request->tipo) {
            $query->where('tipo', $request->tipo);
        }
        
        $mantenimientos = $query->orderBy('fecha_inicio', 'desc')
                             ->paginate(12);
            
        // Formatear los datos para la respuesta
        $mantenimientos->getCollection()->transform(function ($mantenimiento) {
            // Asegurar que el costo sea un número
            if (isset($mantenimiento->costo)) {
                $mantenimiento->costo = (float) $mantenimiento->costo;
            }
            
            // Formatear las fechas si es necesario
            if ($mantenimiento->fecha_inicio && is_string($mantenimiento->fecha_inicio)) {
                $mantenimiento->fecha_inicio = \Carbon\Carbon::parse($mantenimiento->fecha_inicio)->format('Y-m-d');
            }
            
            if ($mantenimiento->fecha_fin && is_string($mantenimiento->fecha_fin)) {
                $mantenimiento->fecha_fin = \Carbon\Carbon::parse($mantenimiento->fecha_fin)->format('Y-m-d');
            }
            
            // Asegurar que el vehículo tenga un nombre completo
            if ($mantenimiento->vehiculo) {
                $mantenimiento->vehiculo->nombre_completo = trim(($mantenimiento->vehiculo->marca ?? '') . ' ' . ($mantenimiento->vehiculo->modelo ?? ''));
                
                // Asegurar que la imagen del vehículo tenga la URL completa
                if ($mantenimiento->vehiculo->imagen) {
                    $mantenimiento->vehiculo->imagen = asset('storage/' . $mantenimiento->vehiculo->imagen);
                }
            }
            
            return $mantenimiento;
        });
        
        return response()->json($mantenimientos);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'tipo' => 'required|in:revision,reparacion,mantenimiento,inspeccion,lavado,otro',
            'prioridad' => 'required|in:baja,media,alta',
            'costo' => 'required|numeric|min:0',
            'estado' => 'required|in:programado,en_progreso,completado,cancelado',
            'taller' => 'nullable|string|max:255',
            'factura_numero' => 'nullable|string|max:100',
            'responsable' => 'required|string|max:255',
            'realizado_por' => 'nullable|string|max:255',
            'kilometraje' => 'nullable|integer|min:0',
            'observaciones' => 'nullable|string',
            'mano_obra' => 'required|numeric|min:0',
            'materiales' => 'required|numeric|min:0',
        ]);
        
        // Asegurar que los valores numéricos sean correctos
        $datos['costo'] = (float) $datos['costo'];
        $datos['mano_obra'] = isset($datos['mano_obra']) ? (float) $datos['mano_obra'] : 0;
        $datos['materiales'] = isset($datos['materiales']) ? (float) $datos['materiales'] : 0;
        
        // Si no se proporciona fecha de fin, establecerla como nula
        if (empty($datos['fecha_fin'])) {
            $datos['fecha_fin'] = null;
        }
        
        // Si no se proporciona realizado_por, usar el valor de responsable
        if (empty($datos['realizado_por'])) {
            $datos['realizado_por'] = $datos['responsable'];
        }
        
        $mantenimiento = Mantenimiento::create($datos);
        
        // Cargar la relación con el vehículo para la respuesta
        $mantenimiento->load('vehiculo');
        
        return response()->json($mantenimiento, 201);
    }

    public function show(Mantenimiento $mantenimiento)
    {
        $mantenimiento->load('vehiculo');
        return response()->json($mantenimiento);
    }

    public function update(Request $request, Mantenimiento $mantenimiento)
    {
        $reglas = [
            'vehiculo_id' => 'sometimes|exists:vehiculos,id',
            'titulo' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'tipo' => 'sometimes|in:revision,reparacion,mantenimiento,inspeccion,lavado,otro',
            'prioridad' => 'sometimes|in:baja,media,alta',
            'costo' => 'sometimes|numeric|min:0',
            'estado' => 'sometimes|in:programado,en_progreso,completado,cancelado',
            'taller' => 'nullable|string|max:255',
            'factura_numero' => 'nullable|string|max:100',
            'responsable' => 'sometimes|string|max:255',
            'realizado_por' => 'nullable|string|max:255',
            'kilometraje' => 'nullable|integer|min:0',
            'observaciones' => 'nullable|string',
            'mano_obra' => 'sometimes|numeric|min:0',
            'materiales' => 'sometimes|numeric|min:0',
        ];

        $datos = $request->validate($reglas);
        
        // Asegurar que los valores numéricos sean correctos
        if (isset($datos['costo'])) {
            $datos['costo'] = (float) $datos['costo'];
        }
        if (isset($datos['mano_obra'])) {
            $datos['mano_obra'] = (float) $datos['mano_obra'];
        }
        if (isset($datos['materiales'])) {
            $datos['materiales'] = (float) $datos['materiales'];
        }
        
        // Si se actualiza la fecha de inicio, verificar que sea anterior a la fecha de fin
        if (isset($datos['fecha_inicio']) && $mantenimiento->fecha_fin) {
            $fechaFin = $datos['fecha_fin'] ?? $mantenimiento->fecha_fin;
            if (strtotime($datos['fecha_inicio']) > strtotime($fechaFin)) {
                return response()->json([
                    'message' => 'La fecha de inicio no puede ser posterior a la fecha de fin',
                    'errors' => ['fecha_inicio' => ['La fecha de inicio no puede ser posterior a la fecha de fin']]
                ], 422);
            }
        }
        
        // Si se envía una fecha de fin vacía, establecerla como nula
        if (isset($datos['fecha_fin']) && empty($datos['fecha_fin'])) {
            $datos['fecha_fin'] = null;
        }
        
        // Si se actualiza el responsable pero no el realizado_por, copiar el valor
        if (isset($datos['responsable']) && !isset($datos['realizado_por'])) {
            $datos['realizado_por'] = $datos['responsable'];
        }
        
        $mantenimiento->update($datos);
        
        // Cargar la relación con el vehículo para la respuesta
        $mantenimiento->load('vehiculo');
        
        return response()->json($mantenimiento);
    }

    public function destroy(Mantenimiento $mantenimiento)
    {
        $mantenimiento->delete();
        return response()->json(['mensaje' => 'Mantenimiento eliminado']);
    }
}
