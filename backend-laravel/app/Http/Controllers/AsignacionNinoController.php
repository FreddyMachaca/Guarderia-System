<?php

namespace App\Http\Controllers;

use App\Models\AsignacionNino;
use App\Models\Nino;
use App\Models\Grupo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AsignacionNinoController extends Controller
{
    public function listarNinosPorGrupo($grupoId)
    {
        $grupo = Grupo::findOrFail($grupoId);
        
        $asignaciones = AsignacionNino::with('nino')
                        ->where('asn_grp_id', $grupoId)
                        ->get();
        
        $ninosFormateados = $asignaciones->map(function ($asignacion) {
            return [
                'asignacionId' => $asignacion->asn_id,
                'ninoId' => $asignacion->nino->nin_id,
                'nombre' => $asignacion->nino->nin_nombre,
                'apellido' => $asignacion->nino->nin_apellido,
                'edad' => $asignacion->nino->nin_edad,
                'fechaAsignacion' => $asignacion->asn_fecha_asignacion,
                'fechaBaja' => $asignacion->asn_fecha_baja,
                'estado' => $asignacion->asn_estado,
                'observaciones' => $asignacion->asn_observaciones
            ];
        });
        
        return response()->json($ninosFormateados);
    }
    
    public function asignarNino(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ninoId' => 'required|integer|exists:tbl_nin_ninos,nin_id',
            'grupoId' => 'required|integer|exists:tbl_grp_grupos,grp_id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $nino = Nino::findOrFail($request->ninoId);
        $grupo = Grupo::findOrFail($request->grupoId);
        
        // Verificar que el niño no esté ya asignado a otro grupo
        $asignacionActiva = AsignacionNino::where('asn_nin_id', $nino->nin_id)
                            ->where('asn_estado', 'activo')
                            ->whereNull('asn_fecha_baja')
                            ->first();
                            
        if ($asignacionActiva) {
            return response()->json([
                'message' => 'El niño ya está asignado a otro grupo'
            ], 422);
        }
        
        // Verificar que el grupo tenga capacidad disponible
        if ($grupo->capacidadDisponible <= 0) {
            return response()->json([
                'message' => 'El grupo no tiene capacidad disponible'
            ], 422);
        }
        
        // Verificar que la edad del niño esté dentro del rango del grupo
        if ($nino->nin_edad < $grupo->grp_edad_minima || $nino->nin_edad > $grupo->grp_edad_maxima) {
            return response()->json([
                'message' => 'La edad del niño no está dentro del rango permitido para este grupo'
            ], 422);
        }
        
        // Verificar que el grupo esté activo
        if ($grupo->grp_estado !== 'activo') {
            return response()->json([
                'message' => 'No se puede asignar a un grupo inactivo'
            ], 422);
        }
        
        $asignacion = new AsignacionNino();
        $asignacion->asn_nin_id = $nino->nin_id;
        $asignacion->asn_grp_id = $grupo->grp_id;
        $asignacion->asn_fecha_asignacion = now();
        $asignacion->asn_estado = 'activo';
        $asignacion->save();
        
        return response()->json([
            'message' => 'Niño asignado correctamente',
            'asignacion' => $asignacion
        ], 201);
    }
    
    public function darDeBaja(Request $request, $asignacionId)
    {
        $validator = Validator::make($request->all(), [
            'observaciones' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $asignacion = AsignacionNino::findOrFail($asignacionId);
        
        if ($asignacion->asn_estado === 'inactivo') {
            return response()->json([
                'message' => 'La asignación ya está inactiva'
            ], 422);
        }
        
        $asignacion->asn_fecha_baja = now();
        $asignacion->asn_estado = 'inactivo';
        $asignacion->asn_observaciones = $request->observaciones;
        $asignacion->save();
        
        return response()->json([
            'message' => 'Asignación dada de baja correctamente',
            'asignacion' => $asignacion
        ]);
    }
    
    public function getNinosDisponibles()
    {
        // Obtener niños que no están asignados a ningún grupo activo
        $ninosAsignados = AsignacionNino::where('asn_estado', 'activo')
                          ->whereNull('asn_fecha_baja')
                          ->pluck('asn_nin_id')
                          ->toArray();
        
        $ninosDisponibles = Nino::where('nin_estado', 'activo')
                            ->whereNotIn('nin_id', $ninosAsignados)
                            ->get();
        
        $ninosFormateados = $ninosDisponibles->map(function ($nino) {
            return [
                'id' => $nino->nin_id,
                'nombre' => $nino->nin_nombre . ' ' . $nino->nin_apellido,
                'edad' => $nino->nin_edad,
                'genero' => $nino->nin_genero
            ];
        });
        
        return response()->json($ninosFormateados);
    }
}
