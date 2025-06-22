<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Grupo;
use App\Models\AsignacionNino;
use App\Models\Nino;

class GrupoController extends Controller
{
    public function index()
    {
        $grupos = Grupo::where('grp_estado', 'activo')->get();
        
        foreach ($grupos as $grupo) {
            $grupo->ninos_asignados = $this->getNinosAsignados($grupo->grp_id);
            $grupo->capacidad_actual = count($grupo->ninos_asignados);
        }

        return response()->json([
            'success' => true,
            'data' => $grupos
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'grp_nombre' => 'required|string|max:100',
            'grp_descripcion' => 'nullable|string',
            'grp_capacidad_maxima' => 'required|integer|min:1',
            'grp_edad_minima' => 'required|integer|min:0',
            'grp_edad_maxima' => 'required|integer|min:0',
            'grp_prs_responsable_id' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->grp_edad_minima > $request->grp_edad_maxima) {
            return response()->json([
                'success' => false,
                'message' => 'La edad mínima no puede ser mayor que la edad máxima'
            ], 422);
        }

        $grupo = Grupo::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Grupo creado exitosamente',
            'data' => $grupo
        ], 201);
    }

    public function show($id)
    {
        $grupo = Grupo::find($id);

        if (!$grupo) {
            return response()->json([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ], 404);
        }

        $grupo->ninos_asignados = $this->getNinosAsignados($id);
        $grupo->capacidad_actual = count($grupo->ninos_asignados);

        return response()->json([
            'success' => true,
            'data' => $grupo
        ]);
    }

    public function update(Request $request, $id)
    {
        $grupo = Grupo::find($id);

        if (!$grupo) {
            return response()->json([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'grp_nombre' => 'required|string|max:100',
            'grp_descripcion' => 'nullable|string',
            'grp_capacidad_maxima' => 'required|integer|min:1',
            'grp_edad_minima' => 'required|integer|min:0',
            'grp_edad_maxima' => 'required|integer|min:0',
            'grp_prs_responsable_id' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->grp_edad_minima > $request->grp_edad_maxima) {
            return response()->json([
                'success' => false,
                'message' => 'La edad mínima no puede ser mayor que la edad máxima'
            ], 422);
        }

        $capacidadActual = AsignacionNino::where('asn_grp_id', $id)
                                        ->where('asn_estado', 'activo')
                                        ->count();

        if ($request->grp_capacidad_maxima < $capacidadActual) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede reducir la capacidad por debajo del número actual de niños asignados'
            ], 422);
        }

        $grupo->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Grupo actualizado exitosamente',
            'data' => $grupo
        ]);
    }

    public function destroy($id)
    {
        $grupo = Grupo::find($id);

        if (!$grupo) {
            return response()->json([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ], 404);
        }

        $ninosAsignados = AsignacionNino::where('asn_grp_id', $id)
                                       ->where('asn_estado', 'activo')
                                       ->count();

        if ($ninosAsignados > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un grupo que tiene niños asignados'
            ], 422);
        }

        $grupo->update(['grp_estado' => 'inactivo']);

        return response()->json([
            'success' => true,
            'message' => 'Grupo eliminado exitosamente'
        ]);
    }

    private function getNinosAsignados($grupoId)
    {
        $asignaciones = AsignacionNino::where('asn_grp_id', $grupoId)
                                     ->where('asn_estado', 'activo')
                                     ->get();

        $ninos = [];
        foreach ($asignaciones as $asignacion) {
            $nino = Nino::find($asignacion->asn_nin_id);
            if ($nino) {
                $ninos[] = [
                    'nin_id' => $nino->nin_id,
                    'nin_nombre' => $nino->nin_nombre,
                    'nin_apellido' => $nino->nin_apellido,
                    'nin_edad' => $nino->nin_edad,
                    'fecha_asignacion' => $asignacion->asn_fecha_asignacion
                ];
            }
        }

        return $ninos;
    }
}