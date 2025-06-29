<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PagosController extends Controller
{
    public function index(Request $request)
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

        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $estado = $request->query('estado', '');
        $anio = $request->query('anio', '');
        $mes = $request->query('mes', '');

        $query = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->join('tbl_grp_grupos as grp', 'msg.msg_grp_id', '=', 'grp.grp_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->select(
                'mnc.*',
                'msg.msg_mes',
                'msg.msg_anio',
                'msg.msg_fecha_vencimiento',
                'msg.msg_precio_base',
                DB::raw("CONCAT(nin.nin_nombre, ' ', nin.nin_apellido) as hijo_nombre"),
                'grp.grp_nombre',
                DB::raw('(mnc.mnc_precio_final - COALESCE(mnc.mnc_monto_pagado, 0)) as saldo_pendiente')
            );

        if ($estado) {
            $query->where('mnc.mnc_estado_pago', $estado);
        }

        if ($anio) {
            $query->where('msg.msg_anio', $anio);
        }

        if ($mes) {
            $query->where('msg.msg_mes', $mes);
        }

        $totalRecords = $query->count();
        $totalPages = ceil($totalRecords / $limit);
        $offset = ($page - 1) * $limit;

        $mensualidades = $query->orderBy('msg.msg_anio', 'desc')
                             ->orderBy('msg.msg_mes', 'desc')
                             ->offset($offset)
                             ->limit($limit)
                             ->get();

        foreach ($mensualidades as $mensualidad) {
            $historialPagos = DB::table('tbl_pgm_pagos_mensualidad')
                ->where('pgm_mnc_id', $mensualidad->mnc_id)
                ->orderBy('pgm_fecha_pago', 'desc')
                ->get();

            $mensualidad->historial_pagos = $historialPagos;
        }

        return response()->json([
            'success' => true,
            'data' => $mensualidades,
            'pagination' => [
                'current_page' => (int) $page,
                'total_pages' => (int) $totalPages,
                'total_records' => (int) $totalRecords,
                'per_page' => (int) $limit
            ]
        ]);
    }

    public function show(Request $request, $id)
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

        $mensualidad = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->join('tbl_grp_grupos as grp', 'msg.msg_grp_id', '=', 'grp.grp_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_id', $id)
            ->select(
                'mnc.*',
                'msg.msg_mes',
                'msg.msg_anio',
                'msg.msg_fecha_vencimiento',
                'msg.msg_precio_base',
                'msg.msg_observaciones as grupo_observaciones',
                DB::raw("CONCAT(nin.nin_nombre, ' ', nin.nin_apellido) as hijo_nombre"),
                'nin.nin_foto',
                'nin.nin_edad',
                'grp.grp_nombre',
                DB::raw('(mnc.mnc_precio_final - COALESCE(mnc.mnc_monto_pagado, 0)) as saldo_pendiente')
            )
            ->first();

        if (!$mensualidad) {
            return response()->json([
                'success' => false,
                'message' => 'Mensualidad no encontrada'
            ], 404);
        }

        $historialPagos = DB::table('tbl_pgm_pagos_mensualidad as pgm')
            ->join('tbl_usr_usuarios as usr', 'pgm.pgm_registrado_por', '=', 'usr.usr_id')
            ->where('pgm.pgm_mnc_id', $id)
            ->select(
                'pgm.*',
                DB::raw("CONCAT(usr.usr_nombre, ' ', usr.usr_apellido) as registrado_por_nombre")
            )
            ->orderBy('pgm.pgm_fecha_pago', 'desc')
            ->get();

        $mensualidad->historial_pagos = $historialPagos;

        return response()->json([
            'success' => true,
            'data' => $mensualidad
        ]);
    }

    public function resumen(Request $request)
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

        $totalPagado = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->sum('mnc.mnc_monto_pagado');

        $totalPendiente = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_estado_pago', '!=', 'pagado')
            ->sum(DB::raw('mnc.mnc_precio_final - COALESCE(mnc.mnc_monto_pagado, 0)'));

        $mensualidadesVencidas = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_estado_pago', '!=', 'pagado')
            ->where('msg.msg_fecha_vencimiento', '<', Carbon::now())
            ->count();

        $proximosVencimientos = DB::table('tbl_mnc_mensualidades_nino as mnc')
            ->join('tbl_msg_mensualidades_grupo as msg', 'mnc.mnc_msg_id', '=', 'msg.msg_id')
            ->join('tbl_nin_ninos as nin', 'mnc.mnc_nin_id', '=', 'nin.nin_id')
            ->join('tbl_rel_padres_ninos as rel', 'nin.nin_id', '=', 'rel.rel_nin_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->where('mnc.mnc_estado_pago', '!=', 'pagado')
            ->where('msg.msg_fecha_vencimiento', '>=', Carbon::now())
            ->where('msg.msg_fecha_vencimiento', '<=', Carbon::now()->addDays(30))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_pagado' => $totalPagado,
                'total_pendiente' => $totalPendiente,
                'mensualidades_vencidas' => $mensualidadesVencidas,
                'proximos_vencimientos' => $proximosVencimientos
            ]
        ]);
    }
}
