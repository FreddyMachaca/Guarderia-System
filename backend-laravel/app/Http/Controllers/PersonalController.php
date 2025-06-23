<?php

namespace App\Http\Controllers;

use App\Models\Personal;
use Illuminate\Http\Request;

class PersonalController extends Controller
{
    public function index()
    {
        $personal = Personal::with(['usuario' => function ($query) {
            $query->where('usr_tipo', 'personal');
        }])
        ->whereHas('usuario', function ($query) {
            $query->where('usr_tipo', 'personal');
        })
        ->get()
        ->map(function ($personal) {
            return [
                'id' => $personal->prs_id,
                'codigo' => $personal->prs_codigo_empleado,
                'nombre' => $personal->nombreCompleto(),
                'cargo' => $personal->prs_cargo,
                'fecha_ingreso' => $personal->prs_fecha_ingreso,
                'salario' => $personal->prs_salario,
                'horario' => $personal->prs_horario
            ];
        });

        return response()->json($personal);
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
