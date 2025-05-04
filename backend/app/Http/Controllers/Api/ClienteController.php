<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
    {
        // Usuarios con rol cliente
        $usuarios = \App\Models\Usuario::where('rol', 'cliente')->get()->map(function ($usuario) {
            return [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'apellidos' => $usuario->apellidos,
                'email' => $usuario->email,
                'telefono' => $usuario->telefono,
                'documento_identidad' => $usuario->documento_identidad,
                'fecha_alta' => $usuario->created_at,
                'total_reservas' => method_exists($usuario, 'reservas') ? $usuario->reservas()->count() : null,
                'origen' => 'sistema',
            ];
        });
        // Clientes de la tabla clientes
        $clientes = \App\Models\Cliente::all()->map(function ($cliente) {
            return [
                'id' => 'C' . $cliente->id, // para diferenciar ids
                'nombre' => $cliente->nombre,
                'apellidos' => $cliente->apellidos ?? '',
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
                'documento_identidad' => $cliente->documento_identidad,
                'fecha_alta' => $cliente->created_at,
                'total_reservas' => method_exists($cliente, 'reservas') ? $cliente->reservas()->count() : null,
                'origen' => 'oficina',
            ];
        });
        // Unir ambos arrays
        $todos = $usuarios->concat($clientes)->values();
        return response()->json($todos);
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
