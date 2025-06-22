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
            ->where('usr_tipo', 'familiar')
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
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    private function generateToken($userId)
    {
        return base64_encode($userId . '|' . time() . '|' . rand(1000, 9999));
    }
}