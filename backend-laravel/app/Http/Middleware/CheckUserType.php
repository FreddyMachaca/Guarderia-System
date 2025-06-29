<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckUserType
{
    public function handle(Request $request, Closure $next, ...$allowedTypes)
    {
        $token = $request->header('Authorization');
        
        if (!$token) {
            return response()->json(['message' => 'Token no proporcionado'], 401);
        }

        $token = str_replace('Bearer ', '', $token);
        $tokenData = DB::table('tbl_tkn_tokens')
            ->where('tkn_token', $token)
            ->where('tkn_estado', 'activo')
            ->first();

        if (!$tokenData) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        $user = DB::table('tbl_usr_usuarios')
            ->where('usr_id', $tokenData->tkn_usr_id)
            ->where('usr_estado', 'activo')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if (!in_array($user->usr_tipo, $allowedTypes)) {
            return response()->json([
                'message' => 'Acceso restringido',
                'error' => 'No tienes permisos para acceder a este recurso'
            ], 403);
        }

        $request->attributes->set('user', $user);
        return $next($request);
    }
}
