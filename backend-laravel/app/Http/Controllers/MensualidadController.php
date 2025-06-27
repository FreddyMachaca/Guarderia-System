<?php

namespace App\Http\Controllers;

use App\Models\MensualidadGrupo;
use App\Models\MensualidadNino;
use App\Models\PagoMensualidad;
use App\Models\Grupo;
use App\Models\AsignacionNino;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\PaginationService;

class MensualidadController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $mes = $request->query('mes');
        $anio = $request->query('anio', date('Y'));
        $grupo = $request->query('grupo');

        $query = MensualidadGrupo::with(['grupo', 'mensualidadesNinos.nino']);

        if ($mes) {
            $query->where('msg_mes', $mes);
        }

        if ($anio) {
            $query->where('msg_anio', $anio);
        }

        if ($grupo) {
            $query->where('msg_grp_id', $grupo);
        }

        $query->orderBy('msg_anio', 'desc')
              ->orderBy('msg_mes', 'desc');

        $result = PaginationService::paginate($query, $page, $limit);

        foreach ($result['data'] as $mensualidad) {
            $ninosActivos = AsignacionNino::where('asn_grp_id', $mensualidad->msg_grp_id)
                                         ->where('asn_estado', 'activo')
                                         ->whereNull('asn_fecha_baja')
                                         ->count();
            
            $ninosEnMensualidad = $mensualidad->mensualidadesNinos()->count();
            
            $mensualidad->total_recaudado = $mensualidad->total_recaudado;
            $mensualidad->total_pendiente = $mensualidad->total_pendiente;
            $mensualidad->cantidad_ninos = $mensualidad->cantidad_ninos;
            $mensualidad->ninos_activos_grupo = $ninosActivos;
            $mensualidad->ninos_en_mensualidad = $ninosEnMensualidad;
            $mensualidad->necesita_sincronizacion = $ninosActivos > $ninosEnMensualidad;
            $mensualidad->ninos_faltantes = max(0, $ninosActivos - $ninosEnMensualidad);
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
            'msg_grp_id' => 'required|integer|exists:tbl_grp_grupos,grp_id',
            'msg_precio_base' => 'required|numeric|min:0',
            'msg_mes' => 'required|integer|between:1,12',
            'msg_anio' => 'required|integer|min:2020',
            'msg_fecha_vencimiento' => 'required|date',
            'msg_observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $existente = MensualidadGrupo::where('msg_grp_id', $request->msg_grp_id)
                                    ->where('msg_mes', $request->msg_mes)
                                    ->where('msg_anio', $request->msg_anio)
                                    ->first();

        if ($existente) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una mensualidad para este grupo en el mes y año especificado'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $mensualidadGrupo = MensualidadGrupo::create([
                'msg_grp_id' => $request->msg_grp_id,
                'msg_precio_base' => $request->msg_precio_base,
                'msg_mes' => $request->msg_mes,
                'msg_anio' => $request->msg_anio,
                'msg_fecha_vencimiento' => $request->msg_fecha_vencimiento,
                'msg_observaciones' => $request->msg_observaciones,
                'msg_estado' => 'activo',
                'msg_fecha_creacion' => now()
            ]);

            $ninosActivos = AsignacionNino::where('asn_grp_id', $request->msg_grp_id)
                                         ->where('asn_estado', 'activo')
                                         ->whereNull('asn_fecha_baja')
                                         ->get();

            foreach ($ninosActivos as $asignacion) {
                MensualidadNino::create([
                    'mnc_msg_id' => $mensualidadGrupo->msg_id,
                    'mnc_nin_id' => $asignacion->asn_nin_id,
                    'mnc_precio_final' => $request->msg_precio_base,
                    'mnc_descuento' => 0,
                    'mnc_monto_pagado' => 0,
                    'mnc_estado_pago' => 'pendiente',
                    'mnc_fecha_creacion' => now()
                ]);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Mensualidad creada exitosamente',
                'data' => $mensualidadGrupo
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear mensualidad: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $mensualidad = MensualidadGrupo::with([
            'grupo.responsable.usuario',
            'mensualidadesNinos.nino.relacionesPadres.padre.usuario'
        ])->find($id);

        if (!$mensualidad) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad no encontrada'
            ], 404);
        }

        $ninosActivos = AsignacionNino::where('asn_grp_id', $mensualidad->msg_grp_id)
                                     ->where('asn_estado', 'activo')
                                     ->whereNull('asn_fecha_baja')
                                     ->count();
        
        $ninosEnMensualidad = $mensualidad->mensualidadesNinos()->count();

        $mensualidad->total_recaudado = $mensualidad->total_recaudado;
        $mensualidad->total_pendiente = $mensualidad->total_pendiente;
        $mensualidad->cantidad_ninos = $mensualidad->cantidad_ninos;
        $mensualidad->ninos_activos_grupo = $ninosActivos;
        $mensualidad->ninos_en_mensualidad = $ninosEnMensualidad;
        $mensualidad->necesita_sincronizacion = $ninosActivos > $ninosEnMensualidad;
        $mensualidad->ninos_faltantes = max(0, $ninosActivos - $ninosEnMensualidad);

        return response()->json([
            'success' => true,
            'data' => $mensualidad
        ]);
    }

    public function update(Request $request, $id)
    {
        $mensualidad = MensualidadGrupo::find($id);

        if (!$mensualidad) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'msg_precio_base' => 'required|numeric|min:0',
            'msg_fecha_vencimiento' => 'required|date',
            'msg_observaciones' => 'nullable|string',
            'msg_estado' => 'required|in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mensualidad->update([
            'msg_precio_base' => $request->msg_precio_base,
            'msg_fecha_vencimiento' => $request->msg_fecha_vencimiento,
            'msg_observaciones' => $request->msg_observaciones,
            'msg_estado' => $request->msg_estado
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mensualidad actualizada exitosamente',
            'data' => $mensualidad
        ]);
    }

    public function destroy($id)
    {
        $mensualidad = MensualidadGrupo::find($id);

        if (!$mensualidad) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad no encontrada'
            ], 404);
        }

        $tienePageos = $mensualidad->mensualidadesNinos()
                                  ->where('mnc_estado_pago', 'pagado')
                                  ->exists();

        if ($tienePageos) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar una mensualidad que ya tiene pagos registrados'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $mensualidad->mensualidadesNinos()->delete();
            $mensualidad->delete();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Mensualidad eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar mensualidad: ' . $e->getMessage()
            ], 500);
        }
    }

    public function actualizarPrecioNino(Request $request, $mensualidadId, $ninoId)
    {
        $validator = Validator::make($request->all(), [
            'precio_final' => 'required|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mensualidadNino = MensualidadNino::where('mnc_msg_id', $mensualidadId)
                                         ->where('mnc_nin_id', $ninoId)
                                         ->first();

        if (!$mensualidadNino) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad del niño no encontrada'
            ], 404);
        }

        $mensualidadNino->update([
            'mnc_precio_final' => $request->precio_final,
            'mnc_descuento' => $request->descuento ?? 0,
            'mnc_observaciones' => $request->observaciones
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Precio actualizado exitosamente'
        ]);
    }

    public function registrarPago(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mnc_id' => 'required|integer|exists:tbl_mnc_mensualidades_nino,mnc_id',
            'monto' => 'required|numeric|min:0.01',
            'metodo_pago' => 'required|in:efectivo,transferencia,cheque,tarjeta',
            'numero_recibo' => 'nullable|string|max:50',
            'fecha_pago' => 'required|date',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mensualidadNino = MensualidadNino::find($request->mnc_id);

        if ($mensualidadNino->mnc_estado_pago === 'pagado') {
            return response()->json([
                'success' => false,
                'message' => 'Esta mensualidad ya está pagada completamente'
            ], 422);
        }

        $saldoPendiente = $mensualidadNino->saldo_pendiente;

        if ($request->monto > $saldoPendiente) {
            return response()->json([
                'success' => false,
                'message' => 'El monto excede el saldo pendiente de Bs. ' . number_format($saldoPendiente, 2)
            ], 422);
        }

        DB::beginTransaction();
        try {
            PagoMensualidad::create([
                'pgm_mnc_id' => $request->mnc_id,
                'pgm_monto' => $request->monto,
                'pgm_fecha_pago' => $request->fecha_pago,
                'pgm_metodo_pago' => $request->metodo_pago,
                'pgm_numero_recibo' => $request->numero_recibo,
                'pgm_observaciones' => $request->observaciones,
                'pgm_registrado_por' => auth()->id(),
                'pgm_fecha_registro' => now()
            ]);

            $nuevoMontoPagado = ($mensualidadNino->mnc_monto_pagado ?? 0) + $request->monto;
            $nuevoEstado = $nuevoMontoPagado >= $mensualidadNino->mnc_precio_final ? 'pagado' : 'parcial';

            $mensualidadNino->update([
                'mnc_monto_pagado' => $nuevoMontoPagado,
                'mnc_estado_pago' => $nuevoEstado,
                'mnc_fecha_pago' => $nuevoEstado === 'pagado' ? $request->fecha_pago : $mensualidadNino->mnc_fecha_pago,
                'mnc_metodo_pago' => $request->metodo_pago,
                'mnc_numero_recibo' => $request->numero_recibo
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Pago registrado exitosamente',
                'estado_pago' => $nuevoEstado,
                'saldo_restante' => $mensualidadNino->mnc_precio_final - $nuevoMontoPagado
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar pago: ' . $e->getMessage()
            ], 500);
        }
    }

    public function obtenerGrupos()
    {
        $grupos = Grupo::where('grp_estado', 'activo')
                      ->select('grp_id', 'grp_nombre')
                      ->get();

        return response()->json([
            'success' => true,
            'data' => $grupos
        ]);
    }

    public function reporteMensual(Request $request)
    {
        $mes = $request->query('mes', date('n'));
        $anio = $request->query('anio', date('Y'));

        $mensualidades = MensualidadGrupo::with(['grupo', 'mensualidadesNinos.nino'])
                                        ->where('msg_mes', $mes)
                                        ->where('msg_anio', $anio)
                                        ->get();

        $reporte = [
            'mes' => $mes,
            'anio' => $anio,
            'total_grupos' => $mensualidades->count(),
            'total_ninos' => $mensualidades->sum('cantidad_ninos'),
            'total_recaudado' => $mensualidades->sum('total_recaudado'),
            'total_pendiente' => $mensualidades->sum('total_pendiente'),
            'detalle_grupos' => $mensualidades->map(function($mensualidad) {
                return [
                    'grupo' => $mensualidad->grupo->grp_nombre,
                    'precio_base' => $mensualidad->msg_precio_base,
                    'cantidad_ninos' => $mensualidad->cantidad_ninos,
                    'recaudado' => $mensualidad->total_recaudado,
                    'pendiente' => $mensualidad->total_pendiente,
                    'porcentaje_cobrado' => $mensualidad->cantidad_ninos > 0 
                        ? round(($mensualidad->total_recaudado / ($mensualidad->msg_precio_base * $mensualidad->cantidad_ninos)) * 100, 2)
                        : 0
                ];
            })
        ];

        return response()->json([
            'success' => true,
            'data' => $reporte
        ]);
    }

    public function sincronizarNinos($id)
    {
        $mensualidadGrupo = MensualidadGrupo::find($id);

        if (!$mensualidadGrupo) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad no encontrada'
            ], 404);
        }

        $ninosActivos = AsignacionNino::where('asn_grp_id', $mensualidadGrupo->msg_grp_id)
                                     ->where('asn_estado', 'activo')
                                     ->whereNull('asn_fecha_baja')
                                     ->pluck('asn_nin_id');

        $ninosEnMensualidad = $mensualidadGrupo->mensualidadesNinos()
                                              ->pluck('mnc_nin_id');

        $ninosFaltantes = $ninosActivos->diff($ninosEnMensualidad);

        if ($ninosFaltantes->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No hay niños nuevos para agregar',
                'ninos_agregados' => 0
            ]);
        }

        DB::beginTransaction();
        try {
            foreach ($ninosFaltantes as $ninoId) {
                MensualidadNino::create([
                    'mnc_msg_id' => $mensualidadGrupo->msg_id,
                    'mnc_nin_id' => $ninoId,
                    'mnc_precio_final' => $mensualidadGrupo->msg_precio_base,
                    'mnc_descuento' => 0,
                    'mnc_monto_pagado' => 0,
                    'mnc_estado_pago' => 'pendiente',
                    'mnc_fecha_creacion' => now()
                ]);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Niños sincronizados exitosamente',
                'ninos_agregados' => $ninosFaltantes->count()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al sincronizar niños: ' . $e->getMessage()
            ], 500);
        }
    }

    public function verificarSincronizacion($id)
    {
        $mensualidadGrupo = MensualidadGrupo::find($id);

        if (!$mensualidadGrupo) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad no encontrada'
            ], 404);
        }

        $ninosActivos = AsignacionNino::where('asn_grp_id', $mensualidadGrupo->msg_grp_id)
                                     ->where('asn_estado', 'activo')
                                     ->whereNull('asn_fecha_baja')
                                     ->count();

        $ninosEnMensualidad = $mensualidadGrupo->mensualidadesNinos()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'ninos_activos_grupo' => $ninosActivos,
                'ninos_en_mensualidad' => $ninosEnMensualidad,
                'necesita_sincronizacion' => $ninosActivos > $ninosEnMensualidad,
                'ninos_faltantes' => max(0, $ninosActivos - $ninosEnMensualidad)
            ]
        ]);
    }
}
