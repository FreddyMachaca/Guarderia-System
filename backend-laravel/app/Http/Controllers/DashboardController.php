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
        $personal = Personal::where('per_estado', 'activo')->count();
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
            'semanal' => 'DATE(pgm_fecha_pago)',
            'mensual' => 'DATE(pgm_fecha_pago)',
            'anual' => 'MONTH(pgm_fecha_pago)',
            default => 'MONTH(pgm_fecha_pago)'
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
        
        $pagos = PagoMensualidad::whereYear('pgm_fecha_pago', $anio)
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
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        $padre = Padre::whereHas('usuario', function($query) use ($userId) {
            $query->where('usr_id', $userId);
        })->first();

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        $hijos = $padre->relacionesNinos()->count();
        $pagosPendientes = MensualidadNino::whereHas('nino.relacionesPadres', function($query) use ($padre) {
            $query->where('rel_pdr_id', $padre->pdr_id);
        })->where('mnc_estado_pago', '!=', 'pagado')
          ->sum(DB::raw('mnc_precio_final - COALESCE(mnc_monto_pagado, 0)'));

        $historialPagos = PagoMensualidad::whereHas('mensualidadNino.nino.relacionesPadres', function($query) use ($padre) {
            $query->where('rel_pdr_id', $padre->pdr_id);
        })->whereBetween('pgm_fecha_pago', [Carbon::now()->subMonths(6), Carbon::now()])
          ->select(DB::raw('MONTH(pgm_fecha_pago) as mes'), DB::raw('SUM(pgm_monto) as total'))
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

        $estadoPagos = MensualidadNino::whereHas('nino.relacionesPadres', function($query) use ($padre) {
            $query->where('rel_pdr_id', $padre->pdr_id);
        })->select('mnc_estado_pago', DB::raw('COUNT(*) as cantidad'))
          ->groupBy('mnc_estado_pago')
          ->get();

        $estadoData = $estadoPagos->map(function($estado) {
            $labels = [
                'pagado' => 'Pagado',
                'pendiente' => 'Pendiente',
                'vencido' => 'Vencido'
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
}
