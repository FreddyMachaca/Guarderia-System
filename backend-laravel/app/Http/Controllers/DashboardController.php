<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nino;
use App\Models\Padre;
use App\Models\Personal;
use App\Models\Grupo;
use App\Models\PagoMensualidad;
use App\Models\MensualidadNino;
use App\Models\MensualidadGrupo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function estadisticasBasicas()
    {
        $ninos = Nino::where('nin_estado', 'activo')->count();
        $personal = Personal::whereHas('usuario', function($q) {
            $q->where('usr_estado', 'activo');
        })->count();
        $padres = Padre::where('pdr_estado', 'activo')->count();
        $actividades = 0;

        return response()->json([
            'success' => true,
            'data' => [
                'ninos' => $ninos,
                'personal' => $personal,
                'padres' => $padres,
                'actividades' => $actividades
            ]
        ]);
    }

    public function estadisticas()
    {
        $ingresosTotales = PagoMensualidad::sum('pgm_monto');
        $totalNinos = Nino::where('nin_estado', 'activo')->count();
        $totalGrupos = Grupo::where('grp_estado', 'activo')->count();
        
        $pagosPendientes = MensualidadNino::where('mnc_estado_pago', '!=', 'pagado')
            ->sum(DB::raw('mnc_precio_final - COALESCE(mnc_monto_pagado, 0)'));
        
        $mensualidadesVencidas = MensualidadNino::whereHas('mensualidadGrupo', function($query) {
            $query->where('msg_fecha_vencimiento', '<', now());
        })->where('mnc_estado_pago', '!=', 'pagado')->count();

        $nuevosNinos = Nino::where('nin_fecha_inscripcion', '>=', Carbon::now()->startOfMonth())
            ->where('nin_estado', 'activo')->count();

        $ingresosMesAnterior = PagoMensualidad::whereBetween('pgm_fecha_pago', [
            Carbon::now()->subMonth()->startOfMonth(),
            Carbon::now()->subMonth()->endOfMonth()
        ])->sum('pgm_monto');

        $ingresosMesActual = PagoMensualidad::whereBetween('pgm_fecha_pago', [
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth()
        ])->sum('pgm_monto');

        $crecimientoIngresos = $ingresosMesAnterior > 0 
            ? round((($ingresosMesActual - $ingresosMesAnterior) / $ingresosMesAnterior) * 100, 1)
            : 0;

        $capacidadTotal = Grupo::where('grp_estado', 'activo')->sum('grp_capacidad');
        $ocupacionPromedio = $capacidadTotal > 0 ? round(($totalNinos / $capacidadTotal) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'ingresos_totales' => $ingresosTotales,
                'total_ninos' => $totalNinos,
                'total_grupos' => $totalGrupos,
                'pagos_pendientes' => $pagosPendientes,
                'mensualidades_vencidas' => $mensualidadesVencidas,
                'nuevos_ninos' => $nuevosNinos,
                'crecimiento_ingresos' => $crecimientoIngresos,
                'ocupacion_promedio' => $ocupacionPromedio
            ]
        ]);
    }

    public function ingresos(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfYear());
        $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfYear());
        $periodo = $request->input('periodo', 'anual');

        $query = PagoMensualidad::whereBetween('pgm_fecha_pago', [$fechaInicio, $fechaFin]);

        $groupBy = match($periodo) {
            'semanal' => 'pgm_fecha_pago::date',
            'mensual' => 'pgm_fecha_pago::date',
            'anual' => 'EXTRACT(MONTH FROM pgm_fecha_pago)',
            default => 'EXTRACT(MONTH FROM pgm_fecha_pago)'
        };

        $ingresos = $query->select(
            DB::raw($groupBy . ' as periodo'),
            DB::raw('SUM(pgm_monto) as total')
        )->groupBy('periodo')->orderBy('periodo')->get();

        $data = $ingresos->map(function($ingreso) use ($periodo) {
            if ($periodo === 'anual') {
                $meses = [
                    1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                    5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                    9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
                ];
                return [
                    'x' => $meses[$ingreso->periodo] ?? $ingreso->periodo,
                    'y' => (float) $ingreso->total
                ];
            } else {
                return [
                    'x' => Carbon::parse($ingreso->periodo)->format($periodo === 'semanal' ? 'd/m' : 'd/m'),
                    'y' => (float) $ingreso->total
                ];
            }
        });

        return response()->json([
            'success' => true,
            'data' => $data->values()->all()
        ]);
    }

    public function pagosPorMetodo(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfMonth());
        $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfMonth());

        $pagos = PagoMensualidad::whereBetween('pgm_fecha_pago', [$fechaInicio, $fechaFin])
            ->select('pgm_metodo_pago', DB::raw('SUM(pgm_monto) as total'))
            ->groupBy('pgm_metodo_pago')
            ->get();

        $data = $pagos->map(function($pago) {
            return [
                'id' => ucfirst($pago->pgm_metodo_pago),
                'label' => ucfirst($pago->pgm_metodo_pago),
                'value' => (float) $pago->total
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function ninosPorGrupo()
    {
        $grupos = Grupo::with(['asignacionesActivas'])
            ->where('grp_estado', 'activo')
            ->get();

        $data = $grupos->map(function($grupo) {
            return [
                'grupo' => $grupo->grp_nombre,
                'cantidad' => $grupo->asignacionesActivas->count()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function actividadCalendario(Request $request)
    {
        $anio = $request->input('anio', date('Y'));
        
        $pagos = PagoMensualidad::whereRaw('EXTRACT(YEAR FROM pgm_fecha_pago) = ?', [$anio])
            ->select('pgm_fecha_pago', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('pgm_fecha_pago')
            ->get();

        $data = $pagos->map(function($pago) {
            return [
                'day' => $pago->pgm_fecha_pago,
                'value' => $pago->cantidad
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function ninos(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfYear());
        $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfYear());

        $ninos = Nino::whereBetween('nin_fecha_inscripcion', [$fechaInicio, $fechaFin])
            ->where('nin_estado', 'activo')
            ->with(['asignacionActual.grupo'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ninos
        ]);
    }

    public function datosPadre(Request $request)
    {
        $token = $request->header('Authorization');
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token no proporcionado'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $token);
        $tokenData = DB::table('tbl_tkn_tokens')
            ->where('tkn_token', $token)
            ->where('tkn_estado', 'activo')
            ->first();

        if (!$tokenData) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        }

        $user = DB::table('tbl_usr_usuarios')
            ->where('usr_id', $tokenData->tkn_usr_id)
            ->where('usr_tipo', 'Tutor')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $padre = DB::table('tbl_pdr_padres')
            ->where('pdr_usr_id', $user->usr_id)
            ->where('pdr_estado', 'activo')
            ->first();

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        $hijos = DB::table('tbl_rel_padres_ninos')
            ->where('rel_pdr_id', $padre->pdr_id)
            ->count();

        $pagosPendientes = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_rel_padres_ninos as rel', 'mnc.mnc_nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_estado_pago', '!=', 'pagado')
            ->sum(DB::raw('mnc.mnc_precio_final - COALESCE(mnc.mnc_monto_pagado, 0)'));

        $historialPagos = DB::table('tbl_pgm_pagos_mensualidad as pgm')
            ->join('tbl_mnc_mensualidades_nino as mnc', 'pgm.pgm_mnc_id', '=', 'mnc.mnc_id')
            ->join('tbl_rel_padres_ninos as rel', 'mnc.mnc_nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->whereBetween('pgm.pgm_fecha_pago', [Carbon::now()->subMonths(6), Carbon::now()])
            ->select(DB::raw('EXTRACT(MONTH FROM pgm.pgm_fecha_pago) as mes'), DB::raw('SUM(pgm.pgm_monto) as total'))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        $historialData = $historialPagos->map(function($pago) {
            $meses = [
                1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic'
            ];
            return [
                'x' => $meses[$pago->mes],
                'y' => (float) $pago->total
            ];
        });

        $estadoPagos = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_rel_padres_ninos as rel', 'mnc.mnc_nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->select('mnc.mnc_estado_pago', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('mnc.mnc_estado_pago')
            ->get();

        $estadoData = $estadoPagos->map(function($estado) {
            $labels = [
                'pagado' => 'Pagado',
                'pendiente' => 'Pendiente',
                'vencido' => 'Vencido',
                'parcial' => 'Parcial'
            ];
            return [
                'id' => $labels[$estado->mnc_estado_pago] ?? $estado->mnc_estado_pago,
                'label' => $labels[$estado->mnc_estado_pago] ?? $estado->mnc_estado_pago,
                'value' => $estado->cantidad
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'hijos' => $hijos,
                'mensajes' => 0,
                'pagosPendientes' => $pagosPendientes,
                'eventos' => 0,
                'historialPagos' => $historialData,
                'estadoPagos' => $estadoData
            ]
        ]);
    }

    public function datosCompletoPadre(Request $request)
    {
        $token = $request->header('Authorization');
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token no proporcionado'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $token);
        $tokenData = DB::table('tbl_tkn_tokens')
            ->where('tkn_token', $token)
            ->where('tkn_estado', 'activo')
            ->first();

        if (!$tokenData) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        }

        $user = DB::table('tbl_usr_usuarios')
            ->where('usr_id', $tokenData->tkn_usr_id)
            ->where('usr_tipo', 'Tutor')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $padre = DB::table('tbl_pdr_padres')
            ->where('pdr_usr_id', $user->usr_id)
            ->where('pdr_estado', 'activo')
            ->first();

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        $hijos = DB::table('tbl_rel_padres_ninos as rel')
            ->join('tbl_nin_ninos as nin', 'rel.rel_nin_id', '=', 'nin.nin_id')
            ->leftJoin('tbl_asn_asignaciones_ninos as asn', function($join) {
                $join->on('nin.nin_id', '=', 'asn.asn_nin_id')
                     ->where('asn.asn_estado', '=', 'activo');
            })
            ->leftJoin('tbl_grp_grupos as grp', 'asn.asn_grp_id', '=', 'grp.grp_id')
            ->leftJoin('tbl_prs_personal as prs', 'grp.grp_responsable_id', '=', 'prs.prs_id')
            ->leftJoin('tbl_usr_usuarios as usr_maestro', 'prs.prs_usr_id', '=', 'usr_maestro.usr_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->select(
                'nin.*',
                'grp.grp_nombre',
                'grp.grp_id',
                DB::raw("CONCAT(usr_maestro.usr_nombre, ' ', usr_maestro.usr_apellido) as maestro_nombre")
            )
            ->get();

        foreach ($hijos as $hijo) {
            $ultimaMensualidad = DB::table('tbl_mnc_mensualidades_nino as mnc')
                ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
                ->where('mnc.mnc_nin_id', $hijo->nin_id)
                ->orderBy('msg.msg_anio', 'desc')
                ->orderBy('msg.msg_mes', 'desc')
                ->first();

            if ($ultimaMensualidad) {
                $hijo->ultima_mensualidad = [
                    'mes' => $ultimaMensualidad->msg_mes,
                    'anio' => $ultimaMensualidad->msg_anio,
                    'estado' => $ultimaMensualidad->mnc_estado_pago,
                    'monto_pendiente' => $ultimaMensualidad->mnc_precio_final - ($ultimaMensualidad->mnc_monto_pagado ?? 0)
                ];
            } else {
                $hijo->ultima_mensualidad = null;
            }

            if ($hijo->maestro_nombre) {
                $hijo->maestro = [
                    'nombre_completo' => $hijo->maestro_nombre
                ];
            } else {
                $hijo->maestro = null;
            }

            if ($hijo->grp_nombre) {
                $hijo->grupo = [
                    'grp_id' => $hijo->grp_id,
                    'grp_nombre' => $hijo->grp_nombre
                ];
            } else {
                $hijo->grupo = null;
            }
        }

        $totalHijos = $hijos->count();
        $hijosActivos = $hijos->where('nin_estado', 'activo')->count();

        $pagosPendientes = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_rel_padres_ninos as rel', 'mnc.mnc_nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_estado_pago', '!=', 'pagado')
            ->sum(DB::raw('mnc.mnc_precio_final - COALESCE(mnc.mnc_monto_pagado, 0)'));

        $pagosRecientes = DB::table('tbl_pgm_pagos_mensualidad as pgm')
            ->join('tbl_mnc_mensualidades_nino as mnc', 'pgm.pgm_mnc_id', '=', 'mnc.mnc_id')
            ->join('tbl_rel_padres_ninos as rel', 'mnc.mnc_nin_id', '=', 'rel.rel_nin_id')
            ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->whereBetween('pgm.pgm_fecha_pago', [Carbon::now()->subMonths(6), Carbon::now()])
            ->select(
                DB::raw('msg.msg_mes as mes'),
                DB::raw('msg.msg_anio as anio'),
                DB::raw('SUM(pgm.pgm_monto) as total')
            )
            ->groupBy('msg.msg_mes', 'msg.msg_anio')
            ->orderBy('msg.msg_anio')
            ->orderBy('msg.msg_mes')
            ->get();

        $pagosData = $pagosRecientes->map(function($pago) {
            $meses = [
                1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
                5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
                9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic'
            ];
            return [
                'x' => $meses[$pago->mes] . ' ' . $pago->anio,
                'y' => (float) $pago->total
            ];
        });

        $estadoPagos = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_rel_padres_ninos as rel', 'mnc.mnc_nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->select('mnc.mnc_estado_pago', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('mnc.mnc_estado_pago')
            ->get();

        $estadoData = $estadoPagos->map(function($estado) {
            $labels = [
                'pagado' => 'Pagado',
                'pendiente' => 'Pendiente',
                'vencido' => 'Vencido',
                'parcial' => 'Parcial'
            ];
            return [
                'id' => $labels[$estado->mnc_estado_pago] ?? $estado->mnc_estado_pago,
                'label' => $labels[$estado->mnc_estado_pago] ?? $estado->mnc_estado_pago,
                'value' => $estado->cantidad
            ];
        });

        $proximosVencimientos = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_estado_pago', '!=', 'pagado')
            ->where('msg.msg_fecha_vencimiento', '>=', Carbon::now()->subDays(30))
            ->select(
                DB::raw("CONCAT(nin.nin_nombre, ' ', nin.nin_apellido) as hijo_nombre"),
                'msg.msg_fecha_vencimiento as fecha_vencimiento',
                DB::raw('(mnc.mnc_precio_final - COALESCE(mnc.mnc_monto_pagado, 0)) as monto'),
                DB::raw("CASE 
                    WHEN msg.msg_fecha_vencimiento < CURRENT_DATE THEN -1 * (CURRENT_DATE - msg.msg_fecha_vencimiento)
                    ELSE (msg.msg_fecha_vencimiento - CURRENT_DATE)
                END as dias_restantes")
            )
            ->orderBy('msg.msg_fecha_vencimiento')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'resumen' => [
                    'totalHijos' => $totalHijos,
                    'hijosActivos' => $hijosActivos,
                    'mensajesPendientes' => 0,
                    'pagosPendientes' => $pagosPendientes,
                    'eventosProximos' => 0
                ],
                'hijos' => $hijos,
                'pagosRecientes' => $pagosData,
                'estadoPagos' => $estadoData,
                'proximosVencimientos' => $proximosVencimientos
            ]
        ]);
    }
}
