<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Obtener página actual y elementos por página del request
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 12);
            
            // Iniciar la consulta
            $query = \App\Models\Cliente::select('id', 'nombre', 'apellidos', 'email', 'telefono', 'documento_identidad', 'created_at');
            
            // Aplicar filtros de búsqueda
            if ($request->has('nombre') && $request->nombre) {
                $query->where(function($q) use ($request) {
                    $q->where('nombre', 'like', '%' . $request->nombre . '%')
                      ->orWhere('apellidos', 'like', '%' . $request->nombre . '%');
                });
            }
            
            if ($request->has('email') && $request->email) {
                $query->where('email', 'like', '%' . $request->email . '%');
            }
            
            if ($request->has('telefono') && $request->telefono) {
                // Eliminar todos los caracteres que no sean dígitos
                $telefonoBusqueda = preg_replace('/[^0-9]/', '', $request->telefono);
                
                $query->where(function($q) use ($telefonoBusqueda) {
                    $q->whereRaw("REPLACE(REPLACE(telefono, '-', ''), ' ', '') LIKE ?", ['%' . $telefonoBusqueda . '%']);
                });
            }
            
            if ($request->has('documento_identidad') && $request->documento_identidad) {
                // Eliminar todos los caracteres que no sean letras ni números
                $documentoBusqueda = preg_replace('/[^A-Za-z0-9]/', '', $request->documento_identidad);
                
                $query->where(function($q) use ($documentoBusqueda) {
                    $q->whereRaw("REPLACE(REPLACE(REPLACE(documento_identidad, '-', ''), ' ', ''), '.', '') LIKE ?", ['%' . $documentoBusqueda . '%']);
                });
            }
            
            // Aplicar ordenación y paginación
            $clientes = $query->orderBy('created_at', 'desc')
                           ->paginate($perPage, ['*'], 'page', $page);
            
            // Transformar la colección
            $clientes->getCollection()->transform(function ($cliente) {
                return [
                    'id' => $cliente->id,
                    'nombre' => $cliente->nombre,
                    'apellidos' => $cliente->apellidos ?? '',
                    'email' => $cliente->email,
                    'telefono' => $cliente->telefono ?? 'No especificado',
                    'documento_identidad' => $cliente->documento_identidad ?? 'No especificado',
                    'fecha_alta' => $cliente->created_at->format('Y-m-d H:i:s'),
                    'total_reservas' => 0, // Valor temporal
                    'origen' => 'oficina',
                    'tipo' => 'cliente'
                ];
            });
            
            return response()->json($clientes);
            
        } catch (\Exception $e) {
            \Log::error('Error en ClienteController@index: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar los clientes',
                'message' => $e->getMessage(),
                'trace' => env('APP_DEBUG') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function store(Request $peticion)
    {
        try {
            $mensajes = [
                'email.unique' => 'Este correo ya está en uso.',
                'email.required' => 'El correo es obligatorio.',
                'email.email' => 'El correo no es válido.',
                'documento_identidad.unique' => 'Este Documento de Identidad ya está en uso.',
                'documento_identidad.required' => 'El Documento de Identidad es obligatorio.'
            ];
            $datos = $peticion->validate([
                'nombre' => 'required',
                'email' => 'required|email|unique:clientes,email',
                'telefono' => 'nullable',
                'documento_identidad' => 'required|unique:clientes,documento_identidad',
            ], $mensajes);
            $cliente = \App\Models\Cliente::create($datos);
            return response()->json($cliente, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al guardar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $cliente = \App\Models\Cliente::with('reservas')->findOrFail($id);
        return response()->json($cliente);
    }

    public function update(Request $peticion, $id)
    {
        try {
            $cliente = \App\Models\Cliente::findOrFail($id);
            $mensajes = [
                'email.unique' => 'Este correo ya está en uso.',
                'email.required' => 'El correo es obligatorio.',
                'email.email' => 'El correo no es válido.',
                'documento_identidad.unique' => 'Este Documento de Identidad ya está en uso.',
                'documento_identidad.required' => 'El Documento de Identidad es obligatorio.'
            ];
            $datos = $peticion->validate([
                'nombre' => 'required',
                'email' => 'required|email|unique:clientes,email,' . $cliente->id,
                'telefono' => 'nullable',
                'documento_identidad' => 'required|unique:clientes,documento_identidad,' . $cliente->id,
            ], $mensajes);
            $cliente->update($datos);
            return response()->json($cliente);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al actualizar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $cliente = \App\Models\Cliente::findOrFail($id);
        $cliente->delete();
        return response()->json(['mensaje' => 'Cliente eliminado']);
    }


}
