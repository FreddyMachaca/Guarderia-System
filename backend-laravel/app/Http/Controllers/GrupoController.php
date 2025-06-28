<?php

namespace App\Http\Controllers;

use App\Models\Grupo;
use App\Models\Personal;
use App\Models\AsignacionNino;
use App\Models\Nino;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\PaginationService;

class GrupoController extends Controller
{
    public function index(Request $request)
    {
        $mostrarInactivos = $request->query('estado', 'activo') === 'inactivo';
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $search = $request->query('search', '');
        
        $query = Grupo::with(['responsable.usuario', 'ninosActivos.nino']);
        
        $query->where('grp_estado', $mostrarInactivos ? 'inactivo' : 'activo');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('grp_nombre', 'ILIKE', "%{$search}%")
                  ->orWhere('grp_descripcion', 'ILIKE', "%{$search}%")
                  ->orWhereHas('responsable.usuario', function($sq) use ($search) {
                      $sq->where('usr_nombre', 'ILIKE', "%{$search}%")
                        ->orWhere('usr_apellido', 'ILIKE', "%{$search}%");
                  });
            });
        }
        
        if ($request->has('page') && $request->has('limit')) {
            $result = PaginationService::paginate($query, $page, $limit);
            $grupos = $result['data'];
            $pagination = $result['pagination'];
        } else {
            $grupos = $query->get();
            $pagination = null;
        }
        
        $gruposFormateados = $grupos->map(function ($grupo) {
            return [
                'grp_id' => $grupo->grp_id,
                'grp_nombre' => $grupo->grp_nombre,
                'grp_descripcion' => $grupo->grp_descripcion,
                'grp_capacidad' => $grupo->grp_capacidad,
                'grp_edad_minima' => $grupo->grp_edad_minima,
                'grp_edad_maxima' => $grupo->grp_edad_maxima,
                'grp_responsable_id' => $grupo->grp_responsable_id,
                'grp_educador' => $grupo->responsable ? $grupo->responsable->nombreCompleto() : null,
                'grp_estado' => $grupo->grp_estado,
                'ocupacion' => $grupo->ninosActivos->count(),
            ];
        });
        
        if ($pagination) {
            return response()->json([
                'success' => true,
                'data' => $gruposFormateados,
                'pagination' => $pagination
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $gruposFormateados
        ]);
    }
    
    public function show($id)
    {
        $grupo = Grupo::with(['responsable.usuario', 'ninosActivos.nino'])->findOrFail($id);
        
        return response()->json([
            'id' => $grupo->grp_id,
            'nombre' => $grupo->grp_nombre,
            'descripcion' => $grupo->grp_descripcion,
            'capacidad' => $grupo->grp_capacidad,
            'capacidadDisponible' => $grupo->capacidadDisponible,
            'edadMinima' => $grupo->grp_edad_minima,
            'edadMaxima' => $grupo->grp_edad_maxima,
            'responsable' => $grupo->responsable ? [
                'id' => $grupo->responsable->prs_id,
                'nombre' => $grupo->responsable->nombreCompleto(),
                'cargo' => $grupo->responsable->prs_cargo
            ] : null,
            'estado' => $grupo->grp_estado,
            'ninosAsignados' => $grupo->ninosActivos->map(function ($asignacion) {
                return [
                    'asignacionId' => $asignacion->asn_id,
                    'ninoId' => $asignacion->nino->nin_id,
                    'nombre' => $asignacion->nino->nin_nombre . ' ' . $asignacion->nino->nin_apellido,
                    'edad' => $asignacion->nino->nin_edad,
                    'fechaAsignacion' => $asignacion->asn_fecha_asignacion
                ];
            })
        ]);
    }
    
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'capacidad' => 'required|integer|min:1',
            'edadMinima' => 'required|integer|min:0',
            'edadMaxima' => 'required|integer|min:1|gte:edadMinima',
            'responsableId' => 'required|integer|exists:tbl_prs_personal,prs_id',
            'estado' => 'required|in:activo,inactivo',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        
        $grupo = new Grupo();
        $grupo->grp_nombre = $request->nombre;
        $grupo->grp_descripcion = $request->descripcion;
        $grupo->grp_capacidad = $request->capacidad;
        $grupo->grp_edad_minima = $request->edadMinima;
        $grupo->grp_edad_maxima = $request->edadMaxima;
        $grupo->grp_responsable_id = $request->responsableId;
        $grupo->grp_estado = $request->estado;
        $grupo->grp_fecha_creacion = now();
        $grupo->grp_fecha_actualizacion = now();
        $grupo->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Grupo creado correctamente',
            'grupo' => $grupo
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $grupo = Grupo::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'capacidad' => 'required|integer|min:' . $grupo->ninosActivos()->count(),
            'edadMinima' => 'required|integer|min:0',
            'edadMaxima' => 'required|integer|min:1|gte:edadMinima',
            'responsableId' => 'required|integer|exists:tbl_prs_personal,prs_id',
            'estado' => 'required|in:activo,inactivo',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        
        $grupo->grp_nombre = $request->nombre;
        $grupo->grp_descripcion = $request->descripcion;
        $grupo->grp_capacidad = $request->capacidad;
        $grupo->grp_edad_minima = $request->edadMinima;
        $grupo->grp_edad_maxima = $request->edadMaxima;
        $grupo->grp_responsable_id = $request->responsableId;
        $grupo->grp_estado = $request->estado;
        $grupo->grp_fecha_actualizacion = now();
        $grupo->save();
        
        if ($grupo->grp_estado === 'inactivo') {
            $grupo->ninosActivos()->update([
                'asn_fecha_baja' => now(),
                'asn_estado' => 'inactivo',
                'asn_observaciones' => 'Baja automática por inactivación del grupo'
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Grupo actualizado correctamente',
            'grupo' => $grupo
        ]);
    }
    
    public function destroy($id)
    {
        $grupo = Grupo::findOrFail($id);
        
        if ($grupo->ninosActivos()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el grupo porque tiene niños asignados'
            ], 422);
        }
        
        $grupo->delete();
        
        return response()->json([
            'message' => 'Grupo eliminado correctamente'
        ]);
    }
    
    public function getResponsables()
    {
        $personal = Personal::with('usuario')->get();
        
        $responsables = $personal->map(function ($persona) {
            return [
                'id' => $persona->prs_id,
                'nombre' => $persona->nombreCompleto(),
                'cargo' => $persona->prs_cargo,
                'codigo' => $persona->prs_codigo_empleado
            ];
        });
        
        return response()->json($responsables);
    }
    
    public function getNinosPorGrupo($id)
    {
        $grupo = Grupo::find($id);
        
        if (!$grupo) {
            return response()->json([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ], 404);
        }
        
        $asignaciones = AsignacionNino::where('asn_grp_id', $id)
            ->where('asn_estado', 'activo')
            ->whereNull('asn_fecha_baja')
            ->get();
        
        $ninos = [];
        
        foreach ($asignaciones as $asignacion) {
            $nino = Nino::find($asignacion->asn_nin_id);
            if ($nino) {
                $ninos[] = [
                    'ninoId' => $nino->nin_id,
                    'nombre' => $nino->nin_nombre,
                    'apellido' => $nino->nin_apellido,
                    'edad' => $nino->nin_edad,
                    'genero' => $nino->nin_genero,
                    'foto' => $nino->nin_foto,
                    'estado' => $nino->nin_estado,
                    'asignacionId' => $asignacion->asn_id,
                    'fechaAsignacion' => $asignacion->asn_fecha_asignacion,
                    'estado' => $asignacion->asn_estado
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $ninos
        ]);
    }
    
    public function desactivar($id)
    {
        $grupo = Grupo::findOrFail($id);
        
        $grupo->grp_estado = 'inactivo';
        $grupo->grp_fecha_actualizacion = now();
        $grupo->save();
        
        $grupo->ninosActivos()->update([
            'asn_fecha_baja' => now(),
            'asn_estado' => 'inactivo',
            'asn_observaciones' => 'Baja automática por inactivación del grupo'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Grupo desactivado correctamente'
        ]);
    }
    
    public function activar($id)
    {
        $grupo = Grupo::findOrFail($id);
        
        $grupo->grp_estado = 'activo';
        $grupo->grp_fecha_actualizacion = now();
        $grupo->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Grupo activado correctamente'
        ]);
    }
}
