<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class VehiculoController extends Controller
{
    public function index(Request $request)
    {
        $porPagina = $request->input('per_page', 12);
        
        $query = \App\Models\Vehiculo::with('reservas');
        
        // Aplicar filtros de búsqueda
        if ($request->has('matricula') && $request->matricula) {
            $query->where('matricula', 'like', '%' . $request->matricula . '%');
        }
        
        if ($request->has('tipo') && $request->tipo) {
            $query->where('tipo', $request->tipo);
        }
        
        if ($request->has('localizacion') && $request->localizacion) {
            $query->where('localizacion', $request->localizacion);
        }
        
        if ($request->has('estado') && $request->estado) {
            $query->where('estado', $request->estado);
        }
        
        $vehiculos = $query->orderBy('created_at', 'desc')
                         ->paginate($porPagina);
            
        // Añadir URL accesible para la imagen
        $vehiculos->getCollection()->transform(function ($vehiculo) {
            if ($vehiculo->imagen) {
                $vehiculo->imagen = asset('storage/' . $vehiculo->imagen);
            }
            return $vehiculo;
        });
        
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

    public function estadisticasPrecios()
    {
        try {
            // Obtener estadísticas de precios
            $precioPromedio = (float) \App\Models\Vehiculo::avg('precio_dia');
            $precioMinimo = (float) \App\Models\Vehiculo::min('precio_dia');
            $precioMaximo = (float) \App\Models\Vehiculo::max('precio_dia');
            
            // Obtener vehículos por rango de precios
            $rangosPrecios = [
                'economico' => (int) \App\Models\Vehiculo::where('precio_dia', '<', 50)->count(),
                'estandar' => (int) \App\Models\Vehiculo::whereBetween('precio_dia', [50, 100])->count(),
                'premium' => (int) \App\Models\Vehiculo::where('precio_dia', '>', 100)->count(),
            ];
            
            // Vehículos más rentables (más reservados)
            $vehiculosPopulares = [];
            try {
                $vehiculosPopulares = \App\Models\Vehiculo::withCount(['reservas' => function($query) {
                        $query->where('estado', '!=', 'cancelada');
                    }])
                    ->orderBy('reservas_count', 'desc')
                    ->take(5)
                    ->get()
                    ->map(function($vehiculo) {
                        return [
                            'id' => $vehiculo->id ?? 0,
                            'nombre' => ($vehiculo->marca ?? '') . ' ' . ($vehiculo->modelo ?? ''),
                            'precio_dia' => (float) ($vehiculo->precio_dia ?? 0),
                            'total_reservas' => (int) ($vehiculo->reservas_count ?? 0),
                            'ingresos_totales' => (float) ($vehiculo->reservas->where('estado', '!=', 'cancelada')->sum('precio_total') ?? 0)
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                \Log::error('Error al obtener vehículos populares: ' . $e->getMessage());
            }
            
            // Obtener reservas activas (no canceladas y con fecha de fin en el futuro)
            $reservasActivas = 0;
            try {
                $reservasActivas = (int) \App\Models\Reserva::where('estado', '!=', 'cancelada')
                    ->where('fecha_fin', '>=', now()->format('Y-m-d'))
                    ->count();
            } catch (\Exception $e) {
                \Log::error('Error al contar reservas activas: ' . $e->getMessage());
            }
            
            // Obtener total de clientes
            $totalClientes = (int) \App\Models\Cliente::count();
            
            // Obtener últimas 10 reservas
            $ultimasReservas = [];
            try {
                $ultimasReservas = \App\Models\Reserva::with(['cliente', 'vehiculo'])
                    ->orderBy('created_at', 'desc')
                    ->take(10)
                    ->get()
                    ->map(function($reserva) {
                        try {
                            $fechaInicio = $reserva->fecha_inicio 
                                ? (is_string($reserva->fecha_inicio) 
                                    ? \Carbon\Carbon::parse($reserva->fecha_inicio)
                                    : $reserva->fecha_inicio)
                                : null;
                                
                            $fechaFin = $reserva->fecha_fin
                                ? (is_string($reserva->fecha_fin)
                                    ? \Carbon\Carbon::parse($reserva->fecha_fin)
                                    : $reserva->fecha_fin)
                                : null;
                            
                            return [
                                'id' => $reserva->id ?? 0,
                                'cliente' => $reserva->cliente 
                                    ? (($reserva->cliente->nombre ?? '') . ' ' . ($reserva->cliente->apellidos ?? ''))
                                    : 'Cliente no disponible',
                                'vehiculo' => $reserva->vehiculo 
                                    ? (($reserva->vehiculo->marca ?? '') . ' ' . ($reserva->vehiculo->modelo ?? ''))
                                    : 'Vehículo no disponible',
                                'fecha_inicio' => $fechaInicio ? $fechaInicio->format('Y-m-d') : 'Fecha no disponible',
                                'fecha_fin' => $fechaFin ? $fechaFin->format('Y-m-d') : 'Fecha no disponible',
                                'estado' => $reserva->estado ?? 'desconocido',
                                'importe' => (float) ($reserva->precio_total ?? 0)
                            ];
                        } catch (\Exception $e) {
                            \Log::error('Error al procesar reserva ID ' . ($reserva->id ?? 'desconocido') . ': ' . $e->getMessage());
                            return null;
                        }
                    })
                    ->filter()
                    ->values()
                    ->toArray();
            } catch (\Exception $e) {
                \Log::error('Error al obtener últimas reservas: ' . $e->getMessage());
            }
            
            // Calcular ingresos mensuales
            $ingresosMensuales = 0;
            try {
                $ingresosMensuales = (float) \App\Models\Reserva::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->where('estado', '!=', 'cancelada')
                    ->sum('precio_total');
            } catch (\Exception $e) {
                \Log::error('Error al calcular ingresos mensuales: ' . $e->getMessage());
            }
            
            return response()->json([
                'precio_promedio' => $precioPromedio,
                'precio_minimo' => $precioMinimo,
                'precio_maximo' => $precioMaximo,
                'rangos_precios' => $rangosPrecios,
                'vehiculos_populares' => $vehiculosPopulares,
                'total_vehiculos' => (int) \App\Models\Vehiculo::count(),
                'vehiculos_disponibles' => (int) \App\Models\Vehiculo::where('estado', 'disponible')->count(),
                'ingresos_mensuales' => $ingresosMensuales,
                'reservas_activas' => $reservasActivas,
                'total_clientes' => $totalClientes,
                'ultimas_reservas' => $ultimasReservas,
                'estado' => 'success',
                'mensaje' => 'Estadísticas obtenidas correctamente'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error en estadisticasPrecios: ' . $e->getMessage());
            return response()->json([
                'estado' => 'error',
                'mensaje' => 'Error al obtener las estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
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
