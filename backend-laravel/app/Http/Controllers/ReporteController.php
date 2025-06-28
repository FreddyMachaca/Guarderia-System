<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use App\Models\MensualidadNino;
use App\Models\Nino;
use App\Models\Grupo;
use App\Models\PagoMensualidad;
use App\Models\AsignacionNino;
use App\Exports\IngresosExport;
use App\Exports\NinosInscritosExport;
use App\Exports\GruposExport;
use App\Exports\PagosExport;
use App\Exports\AsignacionesExport;

class ReporteController extends Controller
{
    public function reporteIngresos(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $tipo = $request->input('tipo', 'pdf');

        $ingresos = PagoMensualidad::with(['mensualidadNino.nino', 'mensualidadNino.mensualidadGrupo.grupo'])
            ->whereBetween('pgm_fecha_pago', [$fechaInicio, $fechaFin])
            ->orderBy('pgm_fecha_pago', 'desc')
            ->get();

        $totalIngresos = $ingresos->sum('pgm_monto');
        $ingresosPorMetodo = $ingresos->groupBy('pgm_metodo_pago')->map(function($pagos) {
            return $pagos->sum('pgm_monto');
        });
        $ingresosPorMes = $ingresos->groupBy(function($pago) {
            return Carbon::parse($pago->pgm_fecha_pago)->format('Y-m');
        })->map(function($pagos) {
            return $pagos->sum('pgm_monto');
        });

        $data = [
            'titulo' => 'Reporte de Ingresos',
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'ingresos' => $ingresos,
            'total_ingresos' => $totalIngresos,
            'ingresos_por_metodo' => $ingresosPorMetodo,
            'ingresos_por_mes' => $ingresosPorMes,
            'fecha_generacion' => Carbon::now()->format('d/m/Y H:i:s')
        ];

        if ($tipo === 'excel') {
            return Excel::download(new IngresosExport($data), 'reporte_ingresos.xlsx');
        }

        $pdf = Pdf::loadView('reportes.ingresos', $data);
        return $pdf->stream('reporte_ingresos.pdf');
    }

    public function reporteNinosInscritos(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfYear()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->format('Y-m-d'));
        $tipo = $request->input('tipo', 'pdf');
        $grupoId = $request->input('grupo_id');

        $query = Nino::with(['asignacionActual.grupo', 'padres.usuario'])
            ->where('nin_estado', 'activo')
            ->whereBetween('nin_fecha_inscripcion', [$fechaInicio, $fechaFin]);

        if ($grupoId) {
            $query->whereHas('asignacionActual', function($q) use ($grupoId) {
                $q->where('asn_grp_id', $grupoId);
            });
        }

        $ninos = $query->orderBy('nin_fecha_inscripcion', 'desc')->get();

        $ninosPorGrupo = $ninos->groupBy(function($nino) {
            return $nino->asignacionActual ? $nino->asignacionActual->grupo->grp_nombre : 'Sin Grupo';
        });

        $ninosPorEdad = $ninos->groupBy('nin_edad');
        $ninosPorGenero = $ninos->groupBy('nin_genero');

        $data = [
            'titulo' => 'Reporte de Niños Inscritos',
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'ninos' => $ninos,
            'total_ninos' => $ninos->count(),
            'ninos_por_grupo' => $ninosPorGrupo,
            'ninos_por_edad' => $ninosPorEdad,
            'ninos_por_genero' => $ninosPorGenero,
            'fecha_generacion' => Carbon::now()->format('d/m/Y H:i:s')
        ];

        if ($tipo === 'excel') {
            return Excel::download(new NinosInscritosExport($data), 'reporte_ninos_inscritos.xlsx');
        }

        $pdf = Pdf::loadView('reportes.ninos_inscritos', $data);
        return $pdf->stream('reporte_ninos_inscritos.pdf');
    }

    public function reporteGrupos(Request $request)
    {
        $tipo = $request->input('tipo', 'pdf');

        $grupos = Grupo::with(['responsable.usuario', 'asignacionesActivas.nino'])
            ->where('grp_estado', 'activo')
            ->get();

        $estadisticas = $grupos->map(function($grupo) {
            $ninosActivos = $grupo->asignacionesActivas->count();
            $capacidadUtilizada = $ninosActivos > 0 ? ($ninosActivos / $grupo->grp_capacidad) * 100 : 0;
            
            return [
                'grupo' => $grupo,
                'ninos_activos' => $ninosActivos,
                'capacidad_disponible' => $grupo->grp_capacidad - $ninosActivos,
                'capacidad_utilizada' => round($capacidadUtilizada, 2)
            ];
        });

        $data = [
            'titulo' => 'Reporte de Grupos',
            'grupos' => $grupos,
            'estadisticas' => $estadisticas,
            'total_grupos' => $grupos->count(),
            'total_ninos' => $estadisticas->sum('ninos_activos'),
            'fecha_generacion' => Carbon::now()->format('d/m/Y H:i:s')
        ];

        if ($tipo === 'excel') {
            return Excel::download(new GruposExport($data), 'reporte_grupos.xlsx');
        }

        $pdf = Pdf::loadView('reportes.grupos', $data);
        return $pdf->stream('reporte_grupos.pdf');
    }

    public function reportePagos(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $estado = $request->input('estado');
        $tipo = $request->input('tipo', 'pdf');

        $query = MensualidadNino::with(['nino', 'mensualidadGrupo.grupo', 'pagos'])
            ->whereHas('mensualidadGrupo', function($q) use ($fechaInicio, $fechaFin) {
                $q->whereDate('msg_fecha_creacion', '>=', $fechaInicio)
                  ->whereDate('msg_fecha_creacion', '<=', $fechaFin);
            });

        if ($estado) {
            $query->where('mnc_estado_pago', $estado);
        }

        $mensualidades = $query->orderBy('mnc_fecha_creacion', 'desc')->get();

        $estadisticasPago = [
            'total_mensualidades' => $mensualidades->count(),
            'pagadas' => $mensualidades->where('mnc_estado_pago', 'pagado')->count(),
            'pendientes' => $mensualidades->where('mnc_estado_pago', 'pendiente')->count(),
            'vencidas' => $mensualidades->where('mnc_estado_pago', 'vencido')->count(),
            'monto_total' => $mensualidades->sum('mnc_precio_final'),
            'monto_pagado' => $mensualidades->sum('mnc_monto_pagado'),
            'monto_pendiente' => $mensualidades->sum('mnc_precio_final') - $mensualidades->sum('mnc_monto_pagado')
        ];

        $data = [
            'titulo' => 'Reporte de Pagos y Mensualidades',
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'mensualidades' => $mensualidades,
            'estadisticas' => $estadisticasPago,
            'fecha_generacion' => Carbon::now()->format('d/m/Y H:i:s')
        ];

        if ($tipo === 'excel') {
            return Excel::download(new PagosExport($data), 'reporte_pagos.xlsx');
        }

        $pdf = Pdf::loadView('reportes.pagos', $data);
        return $pdf->stream('reporte_pagos.pdf');
    }

    public function reporteAsistencia(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->format('Y-m-d'));
        $grupoId = $request->input('grupo_id');
        $tipo = $request->input('tipo', 'pdf');

        $query = AsignacionNino::with(['nino', 'grupo'])
            ->where('asn_estado', 'activo')
            ->whereBetween('asn_fecha_asignacion', [$fechaInicio, $fechaFin]);

        if ($grupoId) {
            $query->where('asn_grp_id', $grupoId);
        }

        $asignaciones = $query->orderBy('asn_fecha_asignacion', 'desc')->get();

        $asignacionesPorGrupo = $asignaciones->groupBy('grupo.grp_nombre');

        $data = [
            'titulo' => 'Reporte de Asignaciones',
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'asignaciones' => $asignaciones,
            'asignaciones_por_grupo' => $asignacionesPorGrupo,
            'total_asignaciones' => $asignaciones->count(),
            'fecha_generacion' => Carbon::now()->format('d/m/Y H:i:s')
        ];

        if ($tipo === 'excel') {
            return Excel::download(new AsignacionesExport($data), 'reporte_asignaciones.xlsx');
        }

        $pdf = Pdf::loadView('reportes.asignaciones', $data);
        return $pdf->stream('reporte_asignaciones.pdf');
    }
}
