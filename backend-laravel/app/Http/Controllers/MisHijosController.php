<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MisHijosController extends Controller
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

        $hijos = DB::table('tbl_rel_padres_ninos as rel')
            ->join('tbl_nin_ninos as nin', 'rel.rel_nin_id', '=', 'nin.nin_id')
            ->leftJoin('tbl_asn_asignaciones_ninos as asn', function($join) {
                $join->on('nin.nin_id', '=', 'asn.asn_nin_id')
                     ->where('asn.asn_estado', '=', 'activo')
                     ->whereNull('asn.asn_fecha_baja');
            })
            ->leftJoin('tbl_grp_grupos as grp', 'asn.asn_grp_id', '=', 'grp.grp_id')
            ->leftJoin('tbl_prs_personal as prs', 'grp.grp_responsable_id', '=', 'prs.prs_id')
            ->leftJoin('tbl_usr_usuarios as usr_maestro', 'prs.prs_usr_id', '=', 'usr_maestro.usr_id')
            ->where('rel.rel_pdr_id', $padre->pdr_id)
            ->select(
                'nin.*',
                'grp.grp_nombre',
                'grp.grp_id',
                'asn.asn_fecha_asignacion',
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
                $hijo->grupo_actual = [
                    'grp_id' => $hijo->grp_id,
                    'grp_nombre' => $hijo->grp_nombre,
                    'fecha_asignacion' => $hijo->asn_fecha_asignacion
                ];
            } else {
                $hijo->grupo_actual = null;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $hijos
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

        $relacion = DB::table('tbl_rel_padres_ninos')
            ->where('rel_pdr_id', $padre->pdr_id)
            ->where('rel_nin_id', $id)
            ->first();

        if (!$relacion) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver la información de este niño'
            ], 403);
        }

        $hijo = DB::table('tbl_nin_ninos as nin')
            ->leftJoin('tbl_asn_asignaciones_ninos as asn', function($join) {
                $join->on('nin.nin_id', '=', 'asn.asn_nin_id')
                     ->where('asn.asn_estado', '=', 'activo')
                     ->whereNull('asn.asn_fecha_baja');
            })
            ->leftJoin('tbl_grp_grupos as grp', 'asn.asn_grp_id', '=', 'grp.grp_id')
            ->leftJoin('tbl_prs_personal as prs', 'grp.grp_responsable_id', '=', 'prs.prs_id')
            ->leftJoin('tbl_usr_usuarios as usr_maestro', 'prs.prs_usr_id', '=', 'usr_maestro.usr_id')
            ->where('nin.nin_id', $id)
            ->select(
                'nin.*',
                'grp.grp_nombre',
                'grp.grp_id',
                'asn.asn_fecha_asignacion',
                DB::raw("CONCAT(usr_maestro.usr_nombre, ' ', usr_maestro.usr_apellido) as maestro_nombre")
            )
            ->first();

        if (!$hijo) {
            return response()->json([
                'success' => false,
                'message' => 'Hijo no encontrado'
            ], 404);
        }

        if ($hijo->maestro_nombre) {
            $hijo->maestro = [
                'nombre_completo' => $hijo->maestro_nombre
            ];
        } else {
            $hijo->maestro = null;
        }

        if ($hijo->grp_nombre) {
            $hijo->grupo_actual = [
                'grp_id' => $hijo->grp_id,
                'grp_nombre' => $hijo->grp_nombre,
                'fecha_asignacion' => $hijo->asn_fecha_asignacion
            ];
        } else {
            $hijo->grupo_actual = null;
        }

        $historialGrupos = DB::table('tbl_asn_asignaciones_ninos as asn')
            ->join('tbl_grp_grupos as grp', 'asn.asn_grp_id', '=', 'grp.grp_id')
            ->where('asn.asn_nin_id', $id)
            ->select(
                'grp.grp_nombre',
                'asn.asn_fecha_asignacion as fecha_asignacion',
                'asn.asn_fecha_baja as fecha_baja',
                'asn.asn_estado as estado',
                'asn.asn_observaciones as observaciones'
            )
            ->orderBy('asn.asn_fecha_asignacion', 'desc')
            ->get();

        $hijo->historial_grupos = $historialGrupos;

        return response()->json([
            'success' => true,
            'data' => $hijo
        ]);
    }
}
