<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function loginParent(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = DB::table('tbl_usr_usuarios')
            ->where('usr_email', $request->email)
            ->where('usr_tipo', 'Tutor')
            ->where('usr_estado', 'activo')
            ->first();

        if (!$user || !Hash::check($request->password, $user->usr_password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $parent = DB::table('tbl_pdr_padres')
            ->where('pdr_usr_id', $user->usr_id)
            ->first();

        $token = $this->generateToken($user->usr_id);
        $this->storeToken($token, $user->usr_id);

        return response()->json([
            'user' => [
                'id' => $user->usr_id,
                'name' => $user->usr_nombre,
                'lastname' => $user->usr_apellido,
                'email' => $user->usr_email,
                'type' => $user->usr_tipo,
                'parent_id' => $parent->pdr_id ?? null
            ],
            'token' => $token,
            'message' => 'Inicio de sesión exitoso'
        ]);
    }

    public function loginStaff(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = DB::table('tbl_usr_usuarios')
            ->where('usr_email', $request->email)
            ->whereIn('usr_tipo', ['personal', 'admin'])
            ->where('usr_estado', 'activo')
            ->first();

        if (!$user || !Hash::check($request->password, $user->usr_password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $staff = DB::table('tbl_prs_personal')
            ->where('prs_usr_id', $user->usr_id)
            ->first();

        $token = $this->generateToken($user->usr_id);
        $this->storeToken($token, $user->usr_id);

        return response()->json([
            'user' => [
                'id' => $user->usr_id,
                'name' => $user->usr_nombre,
                'lastname' => $user->usr_apellido,
                'email' => $user->usr_email,
                'type' => $user->usr_tipo,
                'staff_id' => $staff->prs_id ?? null,
                'employee_code' => $staff->prs_codigo_empleado ?? null
            ],
            'token' => $token,
            'message' => 'Inicio de sesión exitoso'
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->header('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
            DB::table('tbl_tkn_tokens')
                ->where('tkn_token', $token)
                ->update(['tkn_estado' => 'inactivo']);
        }

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function user(Request $request)
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
            ->first();

        return response()->json($user);
    }

    private function generateToken($userId)
    {
        return base64_encode($userId . '|' . time() . '|' . rand(1000, 9999));
    }

    private function storeToken($token, $userId)
    {
        DB::table('tbl_tkn_tokens')->insert([
            'tkn_token' => $token,
            'tkn_usr_id' => $userId,
            'tkn_estado' => 'activo',
            'tkn_fecha_creacion' => now(),
            'tkn_fecha_expiracion' => now()->addDays(30)
        ]);
    }
}