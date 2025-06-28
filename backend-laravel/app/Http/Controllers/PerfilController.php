<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class PerfilController extends Controller
{
    public function show(Request $request)
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
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $userData = [
            'usr_id' => $user->usr_id,
            'usr_nombre' => $user->usr_nombre,
            'usr_apellido' => $user->usr_apellido,
            'usr_email' => $user->usr_email,
            'usr_telefono' => $user->usr_telefono,
            'usr_tipo' => $user->usr_tipo,
            'usr_estado' => $user->usr_estado,
            'puede_editar' => in_array($user->usr_tipo, ['personal', 'admin']),
            'foto_perfil' => null
        ];

        if (in_array($user->usr_tipo, ['personal', 'admin'])) {
            $personal = DB::table('tbl_prs_personal')
                ->where('prs_usr_id', $user->usr_id)
                ->first();
            
            if ($personal && $personal->prs_foto) {
                $userData['foto_perfil'] = $personal->prs_foto;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $userData
        ]);
    }

    public function update(Request $request)
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
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if (!in_array($user->usr_tipo, ['personal', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para editar el perfil'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'usr_nombre' => 'required|string|max:100',
            'usr_apellido' => 'required|string|max:100',
            'usr_email' => 'required|email|unique:tbl_usr_usuarios,usr_email,' . $user->usr_id . ',usr_id',
            'usr_telefono' => 'nullable|string|max:20',
            'usr_password' => 'nullable|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de datos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = [
                'usr_nombre' => $request->usr_nombre,
                'usr_apellido' => $request->usr_apellido,
                'usr_email' => $request->usr_email,
                'usr_telefono' => $request->usr_telefono,
                'usr_fecha_actualizacion' => now()
            ];

            if ($request->filled('usr_password')) {
                $updateData['usr_password'] = Hash::make($request->usr_password);
            }

            DB::table('tbl_usr_usuarios')
                ->where('usr_id', $user->usr_id)
                ->update($updateData);

            $updatedUser = DB::table('tbl_usr_usuarios')
                ->where('usr_id', $user->usr_id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente',
                'data' => [
                    'usr_id' => $updatedUser->usr_id,
                    'usr_nombre' => $updatedUser->usr_nombre,
                    'usr_apellido' => $updatedUser->usr_apellido,
                    'usr_email' => $updatedUser->usr_email,
                    'usr_telefono' => $updatedUser->usr_telefono,
                    'usr_tipo' => $updatedUser->usr_tipo
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateFoto(Request $request)
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
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if (!in_array($user->usr_tipo, ['personal', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para editar la foto'
            ], 403);
        }

        if (!$request->hasFile('foto')) {
            return response()->json([
                'success' => false,
                'message' => 'No se ha enviado ningún archivo de imagen',
                'errors' => ['foto' => ['El campo foto es requerido']]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ], [
            'foto.required' => 'La foto es requerida.',
            'foto.image' => 'El archivo debe ser una imagen válida.',
            'foto.mimes' => 'Solo se permiten imágenes en formato: JPEG, PNG, JPG, GIF.',
            'foto.max' => 'La imagen no puede superar los 2 MB de tamaño.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $personal = DB::table('tbl_prs_personal')
                ->where('prs_usr_id', $user->usr_id)
                ->first();

            if (!$personal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro de personal no encontrado'
                ], 404);
            }

            if ($personal->prs_foto && Storage::disk('public')->exists($personal->prs_foto)) {
                Storage::disk('public')->delete($personal->prs_foto);
            }

            $foto = $request->file('foto');
            $nombreFoto = time() . '_' . uniqid() . '.' . $foto->getClientOriginalExtension();
            $rutaFoto = $foto->storeAs('personal/fotos', $nombreFoto, 'public');

            DB::table('tbl_prs_personal')
                ->where('prs_usr_id', $user->usr_id)
                ->update([
                    'prs_foto' => $rutaFoto
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Foto actualizada exitosamente',
                'data' => [
                    'foto_perfil' => $rutaFoto
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la foto: ' . $e->getMessage()
            ], 500);
        }
    }
}
