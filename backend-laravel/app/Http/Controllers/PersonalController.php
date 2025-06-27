<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Personal;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Support\Facades\DB;

class PersonalController extends Controller
{
    public function index(Request $request)
    {
        $mostrarInactivos = $request->query('estado', 'activo') === 'inactivo';
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $search = $request->query('search', '');
        
        $query = Personal::with(['usuario', 'grupos'])
                         ->whereHas('usuario', function($q) {
                             $q->whereNotNull('usr_id')
                               ->where('usr_tipo', 'personal');
                         });
        
        $query->whereHas('usuario', function($q) use ($mostrarInactivos) {
            $q->where('usr_estado', $mostrarInactivos ? 'inactivo' : 'activo');
        });
        
        if ($search) {
            $query->whereHas('usuario', function($q) use ($search) {
                $q->where('usr_tipo', 'personal')
                  ->where(function($sq) use ($search) {
                      $sq->where('usr_nombre', 'ILIKE', "%{$search}%")
                        ->orWhere('usr_apellido', 'ILIKE', "%{$search}%")
                        ->orWhere('usr_email', 'ILIKE', "%{$search}%");
                  });
            })
            ->orWhere('prs_codigo_empleado', 'ILIKE', "%{$search}%")
            ->orWhere('prs_cargo', 'ILIKE', "%{$search}%");
        }
        
        $result = PaginationService::paginate($query, $page, $limit);
        
        foreach ($result['data'] as $personal) {
            if (!$personal->usuario) {
                $personal->usuario = (object)[
                    'usr_nombre' => 'Usuario',
                    'usr_apellido' => 'Sin datos',
                    'usr_email' => 'No disponible',
                    'usr_telefono' => null,
                    'usr_estado' => 'inactivo'
                ];
            }
            
            $personal->grupos_asignados = $personal->grupos->count();
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
            'usr_nombre' => 'required|string|max:100',
            'usr_apellido' => 'required|string|max:100',
            'usr_email' => 'required|email|unique:tbl_usr_usuarios,usr_email',
            'usr_password' => 'required|string|min:6',
            'usr_telefono' => 'nullable|string|max:20',
            'prs_codigo_empleado' => 'required|string|max:20|unique:tbl_prs_personal,prs_codigo_empleado',
            'prs_cargo' => 'required|string|max:100',
            'prs_fecha_ingreso' => 'required|date',
            'prs_salario' => 'nullable|numeric|min:0',
            'prs_horario' => 'nullable|string|max:100',
            'prs_ci' => 'nullable|string|max:20',
            'prs_ci_expedido' => 'nullable|string|max:5',
            'prs_foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ], [
            'prs_foto.image' => 'El archivo debe ser una imagen válida.',
            'prs_foto.mimes' => 'Solo se permiten imágenes en formato: JPEG, PNG, JPG, GIF.',
            'prs_foto.max' => 'La imagen no puede superar los 2 MB de tamaño.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de datos',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $maxUsrId = DB::table('tbl_usr_usuarios')->max('usr_id') ?? 0;
            $nextUsrId = $maxUsrId + 1;

            $usuario = User::create([
                'usr_id' => $nextUsrId,
                'usr_nombre' => $request->usr_nombre,
                'usr_apellido' => $request->usr_apellido,
                'usr_email' => $request->usr_email,
                'usr_password' => Hash::make($request->usr_password),
                'usr_telefono' => $request->usr_telefono,
                'usr_tipo' => 'personal',
                'usr_estado' => 'activo',
                'usr_fecha_creacion' => now(),
                'usr_fecha_actualizacion' => now()
            ]);

            $maxPrsId = DB::table('tbl_prs_personal')->max('prs_id') ?? 0;
            $nextPrsId = $maxPrsId + 1;

            $personalData = [
                'prs_id' => $nextPrsId,
                'prs_usr_id' => $usuario->usr_id,
                'prs_codigo_empleado' => $request->prs_codigo_empleado,
                'prs_cargo' => $request->prs_cargo,
                'prs_fecha_ingreso' => $request->prs_fecha_ingreso,
                'prs_salario' => $request->prs_salario,
                'prs_horario' => $request->prs_horario,
                'prs_ci' => $request->prs_ci,
                'prs_ci_expedido' => $request->prs_ci_expedido,
                'prs_fecha_registro' => now()
            ];

            if ($request->hasFile('prs_foto')) {
                $foto = $request->file('prs_foto');
                $nombreFoto = time() . '_' . uniqid() . '.' . $foto->getClientOriginalExtension();
                $rutaFoto = $foto->storeAs('personal/fotos', $nombreFoto, 'public');
                $personalData['prs_foto'] = $rutaFoto;
            }

            $personal = Personal::create($personalData);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Personal registrado exitosamente',
                'data' => $personal->load('usuario')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al registrar personal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el personal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $personal = Personal::with(['usuario', 'grupos'])->find($id);

        if (!$personal) {
            return response()->json([
                'success' => false,
                'message' => 'Personal no encontrado'
            ], 404);
        }

        if (!$personal->usuario) {
            $personal->usuario = (object)[
                'usr_nombre' => 'Usuario',
                'usr_apellido' => 'Sin datos',
                'usr_email' => 'No disponible',
                'usr_telefono' => null,
                'usr_estado' => 'inactivo'
            ];
        }

        $personal->grupos_asignados = $personal->grupos->map(function($grupo) {
            return [
                'grp_id' => $grupo->grp_id,
                'grp_nombre' => $grupo->grp_nombre,
                'grp_estado' => $grupo->grp_estado,
                'ninos_asignados' => $grupo->ninosActivos ? $grupo->ninosActivos->count() : 0
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $personal
        ]);
    }

    public function update(Request $request, $id)
    {
        $personal = Personal::with('usuario')->find($id);

        if (!$personal) {
            return response()->json([
                'success' => false,
                'message' => 'Personal no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'usr_nombre' => 'required|string|max:100',
            'usr_apellido' => 'required|string|max:100',
            'usr_email' => 'required|email|unique:tbl_usr_usuarios,usr_email,' . $personal->usuario->usr_id . ',usr_id',
            'usr_password' => 'nullable|string|min:6',
            'usr_telefono' => 'nullable|string|max:20',
            'prs_codigo_empleado' => 'required|string|max:20|unique:tbl_prs_personal,prs_codigo_empleado,' . $personal->prs_id . ',prs_id',
            'prs_cargo' => 'required|string|max:100',
            'prs_fecha_ingreso' => 'required|date',
            'prs_salario' => 'nullable|numeric|min:0',
            'prs_horario' => 'nullable|string|max:100',
            'prs_ci' => 'nullable|string|max:20',
            'prs_ci_expedido' => 'nullable|string|max:5',
            'prs_foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'usr_estado' => 'nullable|in:activo,inactivo'
        ], [
            'prs_foto.image' => 'El archivo debe ser una imagen válida.',
            'prs_foto.mimes' => 'Solo se permiten imágenes en formato: JPEG, PNG, JPG, GIF.',
            'prs_foto.max' => 'La imagen no puede superar los 2 MB de tamaño.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de datos',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $updateUserData = [
                'usr_nombre' => $request->usr_nombre,
                'usr_apellido' => $request->usr_apellido,
                'usr_email' => $request->usr_email,
                'usr_telefono' => $request->usr_telefono,
                'usr_fecha_actualizacion' => now()
            ];

            if ($request->filled('usr_password')) {
                $updateUserData['usr_password'] = Hash::make($request->usr_password);
            }

            if ($request->filled('usr_estado')) {
                $updateUserData['usr_estado'] = $request->usr_estado;
            }

            $personal->usuario->update($updateUserData);

            $updatePersonalData = [
                'prs_codigo_empleado' => $request->prs_codigo_empleado,
                'prs_cargo' => $request->prs_cargo,
                'prs_fecha_ingreso' => $request->prs_fecha_ingreso,
                'prs_salario' => $request->prs_salario,
                'prs_horario' => $request->prs_horario,
                'prs_ci' => $request->prs_ci,
                'prs_ci_expedido' => $request->prs_ci_expedido
            ];

            if ($request->hasFile('prs_foto')) {
                if ($personal->prs_foto && Storage::disk('public')->exists($personal->prs_foto)) {
                    Storage::disk('public')->delete($personal->prs_foto);
                }

                $foto = $request->file('prs_foto');
                $nombreFoto = time() . '_' . uniqid() . '.' . $foto->getClientOriginalExtension();
                $rutaFoto = $foto->storeAs('personal/fotos', $nombreFoto, 'public');
                $updatePersonalData['prs_foto'] = $rutaFoto;
            }

            $personal->update($updatePersonalData);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Datos del personal actualizados exitosamente',
                'data' => $personal->load('usuario')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al actualizar personal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el personal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $personal = Personal::with('usuario')->find($id);

        if (!$personal) {
            return response()->json([
                'success' => false,
                'message' => 'Personal no encontrado'
            ], 404);
        }

        DB::beginTransaction();
        try {
            $personal->usuario->update(['usr_estado' => 'inactivo']);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Personal dado de baja exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al dar de baja al personal'
            ], 500);
        }
    }

    public function resetPassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nueva_password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $personal = Personal::with('usuario')->find($id);

        if (!$personal) {
            return response()->json([
                'success' => false,
                'message' => 'Personal no encontrado'
            ], 404);
        }

        try {
            $personal->usuario->update([
                'usr_password' => Hash::make($request->nueva_password),
                'usr_fecha_actualizacion' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la contraseña'
            ], 500);
        }
    }

    public function listaPersonal()
    {
        $personal = Personal::select(
                'tbl_prs_personal.prs_id', 
                'tbl_usr_usuarios.usr_nombre', 
                'tbl_usr_usuarios.usr_apellido'
            )
            ->join('tbl_usr_usuarios', 'tbl_prs_personal.prs_usr_id', '=', 'tbl_usr_usuarios.usr_id')
            ->where('tbl_usr_usuarios.usr_estado', 'activo')
            ->where('tbl_usr_usuarios.usr_tipo', 'personal')
            ->orderBy('tbl_usr_usuarios.usr_apellido')
            ->get();

        return response()->json($personal);
    }
}
