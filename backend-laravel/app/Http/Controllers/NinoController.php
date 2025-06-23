<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Nino;
use App\Models\Grupo;
use App\Models\AsignacionNino;
use App\Services\PaginationService;

class NinoController extends Controller
{
    public function index(Request $request)
    {
        $incluirInactivos = $request->query('incluir_inactivos', false);
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $search = $request->query('search', '');
        $grupo = $request->query('grupo', '');
        
        $query = Nino::query();
        
        if (!$incluirInactivos) {
            $query->where('nin_estado', 'activo');
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nin_nombre', 'ILIKE', "%{$search}%")
                  ->orWhere('nin_apellido', 'ILIKE', "%{$search}%")
                  ->orWhere('nin_ci', 'LIKE', "%{$search}%");
            });
        }
        
        if ($grupo) {
            $query->whereHas('asignacionActual.grupo', function($q) use ($grupo) {
                $q->where('grp_nombre', $grupo);
            });
        }
        
        $result = PaginationService::paginate($query, $page, $limit);
        
        foreach ($result['data'] as $nino) {
            $nino->grupo_actual = $this->getGrupoActual($nino->nin_id);
        }

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'pagination' => $result['pagination']
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nin_nombre' => 'required|string|max:100',
            'nin_apellido' => 'required|string|max:100',
            'nin_fecha_nacimiento' => 'required|date',
            'nin_edad' => 'required|integer|min:0|max:10',
            'nin_genero' => 'required|in:masculino,femenino',
            'nin_ci' => 'required|string|max:20',
            'nin_ci_ext' => 'required|string|max:5',
            'nin_tutor_legal' => 'required|string|max:200',
            'nin_foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'nin_alergias' => 'nullable|string',
            'nin_medicamentos' => 'nullable|string',
            'nin_observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['nin_fecha_inscripcion'] = now();
        $data['nin_estado'] = 'activo';

        if ($request->hasFile('nin_foto')) {
            $foto = $request->file('nin_foto');
            $nombreFoto = time() . '_' . $foto->getClientOriginalName();
            $rutaFoto = $foto->storeAs('ninos/fotos', $nombreFoto, 'public');
            $data['nin_foto'] = $rutaFoto;
        }

        $nino = Nino::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Niño registrado exitosamente',
            'data' => $nino
        ], 201);
    }

    public function show($id)
    {
        $nino = Nino::find($id);

        if (!$nino) {
            return response()->json([
                'success' => false,
                'message' => 'Niño no encontrado'
            ], 404);
        }

        $nino->grupo_actual = $this->getGrupoActual($id);
        $nino->historial_grupos = $this->getHistorialGrupos($id);

        return response()->json([
            'success' => true,
            'data' => $nino
        ]);
    }

    public function update(Request $request, $id)
    {
        $nino = Nino::find($id);

        if (!$nino) {
            return response()->json([
                'success' => false,
                'message' => 'Niño no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nin_nombre' => 'required|string|max:100',
            'nin_apellido' => 'required|string|max:100',
            'nin_fecha_nacimiento' => 'required|date',
            'nin_edad' => 'required|integer|min:0|max:10',
            'nin_genero' => 'required|in:masculino,femenino',
            'nin_ci' => 'required|string|max:20',
            'nin_ci_ext' => 'required|string|max:5',
            'nin_tutor_legal' => 'required|string|max:200',
            'nin_foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'nin_alergias' => 'nullable|string',
            'nin_medicamentos' => 'nullable|string',
            'nin_observaciones' => 'nullable|string',
            'nin_estado' => 'nullable|in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        if ($request->hasFile('nin_foto')) {
            if ($nino->nin_foto && Storage::disk('public')->exists($nino->nin_foto)) {
                Storage::disk('public')->delete($nino->nin_foto);
            }

            $foto = $request->file('nin_foto');
            $nombreFoto = time() . '_' . $foto->getClientOriginalName();
            $rutaFoto = $foto->storeAs('ninos/fotos', $nombreFoto, 'public');
            $data['nin_foto'] = $rutaFoto;
        }

        $nino->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Datos del niño actualizados exitosamente',
            'data' => $nino
        ]);
    }

    public function destroy($id)
    {
        $nino = Nino::find($id);

        if (!$nino) {
            return response()->json([
                'success' => false,
                'message' => 'Niño no encontrado'
            ], 404);
        }

        $nino->update(['nin_estado' => 'inactivo']);

        AsignacionNino::where('asn_nin_id', $id)
                     ->where('asn_estado', 'activo')
                     ->update([
                         'asn_estado' => 'inactivo',
                         'asn_fecha_baja' => now()
                     ]);

        return response()->json([
            'success' => true,
            'message' => 'Niño dado de baja exitosamente'
        ]);
    }

    public function asignarGrupo(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'grp_id' => 'required|integer',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $nino = Nino::find($id);
        if (!$nino) {
            return response()->json([
                'success' => false,
                'message' => 'Niño no encontrado'
            ], 404);
        }

        $grupo = Grupo::find($request->grp_id);
        if (!$grupo) {
            return response()->json([
                'success' => false,
                'message' => 'Grupo no encontrado'
            ], 404);
        }

        if ($nino->nin_edad < $grupo->grp_edad_minima || $nino->nin_edad > $grupo->grp_edad_maxima) {
            return response()->json([
                'success' => false,
                'message' => 'La edad del niño no es compatible con el grupo seleccionado'
            ], 422);
        }

        $capacidadActual = AsignacionNino::where('asn_grp_id', $request->grp_id)
                                       ->where('asn_estado', 'activo')
                                       ->count();

        if ($capacidadActual >= $grupo->grp_capacidad_maxima) {
            return response()->json([
                'success' => false,
                'message' => 'El grupo ha alcanzado su capacidad máxima'
            ], 422);
        }

        AsignacionNino::where('asn_nin_id', $id)
                     ->where('asn_estado', 'activo')
                     ->update([
                         'asn_estado' => 'inactivo',
                         'asn_fecha_baja' => now()
                     ]);

        AsignacionNino::create([
            'asn_nin_id' => $id,
            'asn_grp_id' => $request->grp_id,
            'asn_observaciones' => $request->observaciones
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Niño asignado al grupo exitosamente'
        ]);
    }

    public function removerGrupo($id)
    {
        $nino = Nino::find($id);
        if (!$nino) {
            return response()->json([
                'success' => false,
                'message' => 'Niño no encontrado'
            ], 404);
        }

        AsignacionNino::where('asn_nin_id', $id)
                     ->where('asn_estado', 'activo')
                     ->update([
                         'asn_estado' => 'inactivo',
                         'asn_fecha_baja' => now()
                     ]);

        return response()->json([
            'success' => true,
            'message' => 'Niño removido del grupo exitosamente'
        ]);
    }

    private function getGrupoActual($ninoId)
    {
        $asignacion = AsignacionNino::where('asn_nin_id', $ninoId)
                                   ->where('asn_estado', 'activo')
                                   ->first();

        if ($asignacion) {
            $grupo = Grupo::find($asignacion->asn_grp_id);
            return [
                'grp_id' => $grupo->grp_id,
                'grp_nombre' => $grupo->grp_nombre,
                'fecha_asignacion' => $asignacion->asn_fecha_asignacion
            ];
        }

        return null;
    }

    private function getHistorialGrupos($ninoId)
    {
        $asignaciones = AsignacionNino::where('asn_nin_id', $ninoId)
                                     ->orderBy('asn_fecha_asignacion', 'desc')
                                     ->get();

        $historial = [];
        foreach ($asignaciones as $asignacion) {
            $grupo = Grupo::find($asignacion->asn_grp_id);
            $historial[] = [
                'grp_nombre' => $grupo->grp_nombre,
                'fecha_asignacion' => $asignacion->asn_fecha_asignacion,
                'fecha_baja' => $asignacion->asn_fecha_baja,
                'estado' => $asignacion->asn_estado,
                'observaciones' => $asignacion->asn_observaciones
            ];
        }

        return $historial;
    }
}