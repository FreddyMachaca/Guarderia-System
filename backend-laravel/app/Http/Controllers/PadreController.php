<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\Padre;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Support\Facades\DB;

class PadreController extends Controller
{
    public function index(Request $request)
    {
        $mostrarInactivos = $request->query('estado', 'activo') === 'inactivo';
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);
        $search = $request->query('search', '');
        
        $query = Padre::with(['usuario', 'relacionesNinos.nino'])
                     ->whereHas('usuario', function($q) {
                         $q->whereNotNull('usr_id')
                           ->where('usr_tipo', 'Tutor');
                     });
        
        $query->where('pdr_estado', $mostrarInactivos ? 'inactivo' : 'activo');
        
        if ($search) {
            $query->whereHas('usuario', function($q) use ($search) {
                $q->where('usr_tipo', 'Tutor')
                  ->where(function($sq) use ($search) {
                      $sq->where('usr_nombre', 'ILIKE', "%{$search}%")
                        ->orWhere('usr_apellido', 'ILIKE', "%{$search}%")
                        ->orWhere('usr_email', 'ILIKE', "%{$search}%");
                  });
            })
            ->orWhere('pdr_ci', 'ILIKE', "%{$search}%");
        }
        
        $result = PaginationService::paginate($query, $page, $limit);
        
        foreach ($result['data'] as $padre) {
            // Asegurar que el usuario esté disponible
            if (!$padre->usuario) {
                $padre->usuario = (object)[
                    'usr_nombre' => 'Usuario',
                    'usr_apellido' => 'Sin datos',
                    'usr_email' => 'No disponible',
                    'usr_telefono' => null,
                    'usr_estado' => 'inactivo'
                ];
            }
            
            $padre->ninos_registrados = $padre->relacionesNinos->count();
            
            if ($padre->pdr_contacto_emergencia) {
                $contactoParts = explode(' - ', $padre->pdr_contacto_emergencia);
                $padre->contacto_emergencia_nombre = isset($contactoParts[0]) ? $contactoParts[0] : '';
                $padre->contacto_emergencia_numero = isset($contactoParts[1]) ? $contactoParts[1] : '';
            } else {
                $padre->contacto_emergencia_nombre = '';
                $padre->contacto_emergencia_numero = '';
            }
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
            'pdr_direccion' => 'nullable|string',
            'pdr_ocupacion' => 'nullable|string|max:100',
            'pdr_ci' => 'required|string|max:20',
            'pdr_ci_ext' => 'required|string|max:5',
            'contacto_emergencia_nombre' => 'required|string|max:50',
            'contacto_emergencia_numero' => 'required|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
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
                'usr_tipo' => 'Tutor',
                'usr_estado' => 'activo',
                'usr_fecha_creacion' => now(),
                'usr_fecha_actualizacion' => now()
            ]);

            $contactoEmergencia = $request->contacto_emergencia_nombre . ' - ' . $request->contacto_emergencia_numero;

            $maxPdrId = DB::table('tbl_pdr_padres')->max('pdr_id') ?? 0;
            $nextPdrId = $maxPdrId + 1;

            $padre = Padre::create([
                'pdr_id' => $nextPdrId,
                'pdr_usr_id' => $usuario->usr_id,
                'pdr_direccion' => $request->pdr_direccion,
                'pdr_ocupacion' => $request->pdr_ocupacion,
                'pdr_contacto_emergencia' => $contactoEmergencia,
                'pdr_ci' => $request->pdr_ci,
                'pdr_ci_ext' => $request->pdr_ci_ext,
                'pdr_estado' => 'activo',
                'pdr_fecha_registro' => now()
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Padre registrado exitosamente',
                'data' => $padre->load('usuario')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al registrar padre: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el padre: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $padre = Padre::with(['usuario', 'relacionesNinos.nino'])->find($id);

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        if ($padre->pdr_contacto_emergencia) {
            $contactoParts = explode(' - ', $padre->pdr_contacto_emergencia);
            $padre->contacto_emergencia_nombre = isset($contactoParts[0]) ? $contactoParts[0] : '';
            $padre->contacto_emergencia_numero = isset($contactoParts[1]) ? $contactoParts[1] : '';
        } else {
            $padre->contacto_emergencia_nombre = '';
            $padre->contacto_emergencia_numero = '';
        }

        $padre->ninos_asociados = $padre->relacionesNinos->map(function($relacion) {
            return [
                'nin_id' => $relacion->nino->nin_id,
                'nombre_completo' => $relacion->nino->nin_nombre . ' ' . $relacion->nino->nin_apellido,
                'edad' => $relacion->nino->nin_edad,
                'parentesco' => $relacion->rel_parentesco,
                'estado' => $relacion->nino->nin_estado
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $padre
        ]);
    }

    public function update(Request $request, $id)
    {
        $padre = Padre::with('usuario')->find($id);

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'usr_nombre' => 'required|string|max:100',
            'usr_apellido' => 'required|string|max:100',
            'usr_email' => 'required|email|unique:tbl_usr_usuarios,usr_email,' . $padre->usuario->usr_id . ',usr_id',
            'usr_password' => 'nullable|string|min:6',
            'usr_telefono' => 'nullable|string|max:20',
            'pdr_direccion' => 'nullable|string',
            'pdr_ocupacion' => 'nullable|string|max:100',
            'pdr_ci' => 'required|string|max:20',
            'pdr_ci_ext' => 'required|string|max:5',
            'contacto_emergencia_nombre' => 'required|string|max:50',
            'contacto_emergencia_numero' => 'required|string|max:20',
            'pdr_estado' => 'nullable|in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
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

            if ($request->filled('pdr_estado') && $request->pdr_estado === 'inactivo') {
                $updateUserData['usr_estado'] = 'inactivo';
            } else {
                $updateUserData['usr_estado'] = 'activo';
            }

            $padre->usuario->update($updateUserData);

            $contactoEmergencia = $request->contacto_emergencia_nombre . ' - ' . $request->contacto_emergencia_numero;

            $padre->update([
                'pdr_direccion' => $request->pdr_direccion,
                'pdr_ocupacion' => $request->pdr_ocupacion,
                'pdr_contacto_emergencia' => $contactoEmergencia,
                'pdr_ci' => $request->pdr_ci,
                'pdr_ci_ext' => $request->pdr_ci_ext,
                'pdr_estado' => $request->pdr_estado ?? 'activo'
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Datos del padre actualizados exitosamente',
                'data' => $padre->load('usuario')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al actualizar padre: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el padre: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $padre = Padre::with('usuario')->find($id);

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        DB::beginTransaction();
        try {
            $padre->update(['pdr_estado' => 'inactivo']);
            $padre->usuario->update(['usr_estado' => 'inactivo']);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Padre dado de baja exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al dar de baja al padre'
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

        $padre = Padre::with('usuario')->find($id);

        if (!$padre) {
            return response()->json([
                'success' => false,
                'message' => 'Padre no encontrado'
            ], 404);
        }

        try {
            $padre->usuario->update([
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
}
