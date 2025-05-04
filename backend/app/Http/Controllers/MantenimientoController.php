<?php

namespace App\Http\Controllers;

use App\Models\Mantenimiento;
use Illuminate\Http\Request;

class MantenimientoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $mantenimientos = Mantenimiento::with('vehiculo')->orderBy('fecha', 'desc')->get();
        return response()->json($mantenimientos);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'fecha' => 'required|date',
            'tipo' => 'required|string',
            'costo' => 'required|numeric',
            'estado' => 'required|string',
            'realizado_por' => 'required|string',
        ]);
        $mantenimiento = Mantenimiento::create($datos);
        return response()->json($mantenimiento, 201);
    }

    public function show(Mantenimiento $mantenimiento)
    {
        $mantenimiento->load('vehiculo');
        return response()->json($mantenimiento);
    }

    public function update(Request $request, Mantenimiento $mantenimiento)
    {
        $datos = $request->validate([
            'vehiculo_id' => 'sometimes|exists:vehiculos,id',
            'fecha' => 'sometimes|date',
            'tipo' => 'sometimes|string',
            'costo' => 'sometimes|numeric',
            'estado' => 'sometimes|string',
            'realizado_por' => 'sometimes|string',
        ]);
        $mantenimiento->update($datos);
        return response()->json($mantenimiento);
    }

    public function destroy(Mantenimiento $mantenimiento)
    {
        $mantenimiento->delete();
        return response()->json(['mensaje' => 'Mantenimiento eliminado']);
    }
}
