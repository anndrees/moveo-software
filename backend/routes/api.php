<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AutenticacionController;

Route::post('/register', [AutenticacionController::class, 'registrar']);
Route::post('/login', [AutenticacionController::class, 'iniciarSesion']);
Route::post('/logout', [AutenticacionController::class, 'cerrarSesion'])->middleware('auth:sanctum');
Route::get('/user', [AutenticacionController::class, 'usuario'])->middleware('auth:sanctum');

// Ruta futura para Google: Route::post('/google', ...)

use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\DanoVehiculoController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Route::middleware(['admin'])->group(function () {...});
    Route::apiResource('vehiculos', VehiculoController::class);
    Route::get('vehiculos/estadisticas/precios', [VehiculoController::class, 'estadisticasPrecios']);
    
    // Rutas para daños de vehículos
    Route::get('vehiculos/{vehiculo}/danos', [DanoVehiculoController::class, 'index']);
    Route::post('vehiculos/{vehiculo}/danos', [DanoVehiculoController::class, 'store']);
    Route::get('vehiculos/{vehiculo}/danos/{dano}', [DanoVehiculoController::class, 'show']);
    Route::delete('vehiculos/{vehiculo}/danos/{dano}', [DanoVehiculoController::class, 'destroy']);
    
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('reservas', ReservaController::class);
    Route::put('reservas/{id}/cancelar', [ReservaController::class, 'cancelar'])->name('reservas.cancelar');
    Route::put('reservas/{id}/finalizar', [ReservaController::class, 'finalizar'])->name('reservas.finalizar');
    Route::apiResource('mantenimientos', \App\Http\Controllers\MantenimientoController::class);
    Route::put('usuarios/completar-perfil', [UsuarioController::class, 'completarPerfil']);
    Route::post('usuarios/cambiar-contrasena', [UsuarioController::class, 'cambiarContrasena']);
    Route::get('usuarios/historial-reservas', [UsuarioController::class, 'historialReservas']);
    Route::get('usuarios/vehiculos-reservados', [UsuarioController::class, 'vehiculosReservados']);
});
