<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AutenticacionController extends Controller
{
    // Forzar respuestas JSON en rutas API
    public function __construct()
    {
        if (request()->is('api/*')) {
            request()->headers->set('Accept', 'application/json');
        }
    }
    // Registro de usuario
    public function registrar(Request $request)
    {
        try {
            $mensajes = [
                'nombre.required' => 'El nombre es obligatorio.',
                'nombre.string' => 'El nombre debe ser un texto.',
                'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
                'apellidos.required' => 'Los apellidos son obligatorios.',
                'apellidos.string' => 'Los apellidos deben ser un texto.',
                'apellidos.max' => 'Los apellidos no pueden tener más de 255 caracteres.',
                'email.required' => 'El correo electrónico es obligatorio.',
                'email.email' => 'El correo electrónico no es válido.',
                'email.unique' => 'El correo electrónico ya está registrado.',
                'password.required' => 'La contraseña es obligatoria.',
                'password.string' => 'La contraseña debe ser un texto.',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
                'rol.in' => 'El rol debe ser admin o cliente.',
            ];
            $datos = $request->validate([
                'nombre' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'rol' => 'in:admin,cliente',
            ], $mensajes);
            $usuario = User::create([
                'nombre' => $datos['nombre'],
                'apellidos' => $datos['apellidos'],
                'email' => $datos['email'],
                'password' => Hash::make($datos['password']),
                'rol' => $datos['rol'] ?? 'cliente',
                // 'primera_visita' se queda en true por defecto
            ]);
            $token = $usuario->createToken('auth_token')->plainTextToken;
            return response()->json([
                'usuario' => $usuario,
                'token' => $token,
            ], 201);
        } catch (ValidationException $e) {
            // Unir todos los mensajes en uno solo para el frontend, en español y sin mensaje genérico
            $errores = collect($e->errors())->flatten()->toArray();
            return response()->json([
                'errores' => $errores
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error inesperado al registrar el usuario.',
                'detalle' => $e->getMessage(),
            ], 500);
        }
    }

    // Login
    public function iniciarSesion(Request $request)
    {
        try {
            $datos = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
            $usuario = User::where('email', $datos['email'])->first();
            if (!$usuario || !$usuario->password || !Hash::check($datos['password'], $usuario->password)) {
                return response()->json([
                    'errores' => ['email' => ['Las credenciales son incorrectas o no existen.']],
                    'mensaje' => 'Error de autenticación.'
                ], 401);
            }
            $token = $usuario->createToken('auth_token')->plainTextToken;
            return response()->json([
                'usuario' => $usuario,
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'errores' => $e->errors(),
                'mensaje' => 'Error de validación en el login, vuelva a intentarlo.'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error inesperado al iniciar sesión, intentelo de nuevo mas tarde.',
                'detalle' => $e->getMessage(),
            ], 500);
        }
    }

    // Logout
    public function cerrarSesion(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['mensaje' => 'Sesión cerrada correctamente.']);
    }

    // Usuario autenticado
    public function usuario(Request $request)
    {
        return response()->json($request->user());
    }

    // (Preparado para Google: método futuro)
}
