<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsuarioController extends Controller
{
    // PUT /api/usuarios/completar-perfil
    public function completarPerfil(Request $request)
    {
        // ... (código existente de completarPerfil)
        $usuario_autenticado = Auth::user();
        // Asegurarse de que el usuario autenticado es instancia de Usuario o User
        if (!$usuario_autenticado instanceof User) {
            return response()->json(['mensaje' => 'No se pudo obtener el usuario autenticado.'], 401);
        }
        // Comprobamos que tiene el método save
        if (!method_exists($usuario_autenticado, 'save')) {
            return response()->json(['mensaje' => 'El usuario autenticado no soporta guardar cambios.'], 500);
        }
        $mensajes = [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser un texto.',
            'nombre.max' => 'El nombre no puede tener más de 50 caracteres.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.string' => 'Los apellidos deben ser texto.',
            'apellidos.max' => 'Los apellidos no pueden tener más de 100 caracteres.',
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'El correo debe tener un formato válido.',
            'email.max' => 'El correo no puede tener más de 100 caracteres.',
            'email.unique' => 'Este correo ya está registrado.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.string' => 'El teléfono debe ser un texto.',
            'telefono.max' => 'El teléfono no puede tener más de 30 caracteres.',
            'documento_identidad.required' => 'El documento de identidad es obligatorio.',
            'documento_identidad.string' => 'El documento debe ser un texto.',
            'documento_identidad.max' => 'El documento no puede tener más de 50 caracteres.'
        ];
        try {
            $datos = $request->validate([
                'nombre' => 'required|string|max:50',
                'apellidos' => 'required|string|max:100',
                'email' => 'required|email|max:100|unique:users,email,' . $usuario_autenticado->id,
                'telefono' => 'required|string|max:30',
                'documento_identidad' => 'required|string|max:50',
                'direccion' => 'nullable|string|max:150',
                'numero_carnet' => 'nullable|string|max:30',
                'fecha_caducidad_carnet' => 'nullable|date',
                'foto_perfil' => 'nullable|image|max:2048',
            ], $mensajes);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Email duplicado
            $errors = $e->errors();
            if (isset($errors['email'])) {
                foreach ($errors['email'] as $mensaje) {
                    if (stripos($mensaje, 'ya está registrado') !== false || stripos($mensaje, 'ya ha sido registrado') !== false || stripos($mensaje, 'ya está en uso') !== false || stripos($mensaje, 'existe') !== false) {
                        return response()->json([
                            'mensaje' => 'El correo electrónico ya está registrado.'
                        ], 409);
                    }
                }
            }
            return response()->json(['errors' => $errors], 422);
        }
        $usuario_autenticado->nombre = $datos['nombre'];
        $usuario_autenticado->apellidos = $datos['apellidos'];
        $usuario_autenticado->email = $datos['email'];
        $usuario_autenticado->telefono = $datos['telefono'];
        $usuario_autenticado->documento_identidad = $datos['documento_identidad'];
        $usuario_autenticado->direccion = $datos['direccion'] ?? null;
        $usuario_autenticado->numero_carnet = $datos['numero_carnet'] ?? null;
        $usuario_autenticado->fecha_caducidad_carnet = $datos['fecha_caducidad_carnet'] ?? null;
        // Manejo de imagen de perfil
        if ($request->hasFile('foto_perfil')) {
            // Elimina la anterior si existe
            if ($usuario_autenticado->foto_perfil) {
                Storage::disk('public')->delete($usuario_autenticado->foto_perfil);
            }
            $ruta = $request->file('foto_perfil')->store('perfiles', 'public');
            $usuario_autenticado->foto_perfil = $ruta;
        }
        $usuario_autenticado->primera_visita = false;
        $usuario_autenticado->save();
        return response()->json(['mensaje' => 'Perfil actualizado correctamente']);
    }

    // POST /api/usuarios/cambiar-contrasena
    public function cambiarContrasena(Request $request)
    {
        $usuario = Auth::user();
        $request->validate([
            'contrasena_actual' => 'required|string',
            'nueva_contrasena' => 'required|string|min:8',
            'confirmar_contrasena' => 'required|same:nueva_contrasena',
        ], [
            'contrasena_actual.required' => 'Debes ingresar tu contraseña actual.',
            'nueva_contrasena.required' => 'Debes ingresar una nueva contraseña.',
            'nueva_contrasena.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'confirmar_contrasena.required' => 'Debes confirmar la nueva contraseña.',
            'confirmar_contrasena.same' => 'La confirmación no coincide con la nueva contraseña.'
        ]);
        if (!Hash::check($request->contrasena_actual, $usuario->password)) {
            return response()->json(['mensaje' => 'La contraseña actual es incorrecta.'], 422);
        }
        $usuario->password = bcrypt($request->nueva_contrasena);
        $usuario->save();
        return response()->json(['mensaje' => 'Contraseña cambiada correctamente.']);
    }

    // GET /api/usuarios/historial-reservas
    public function historialReservas(Request $request)
    {
        $usuario = Auth::user();
        $reservas = $usuario->reservas()->with('vehiculo')->orderBy('fecha_inicio', 'desc')->get();
        return response()->json($reservas);
    }
}
