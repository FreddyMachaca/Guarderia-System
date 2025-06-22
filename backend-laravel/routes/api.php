<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NinoController;
use App\Http\Controllers\GrupoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/* RUTAS DE AUTENTICACIÓN */
Route::middleware('api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/login/parent', [AuthController::class, 'loginParent']);
        Route::post('/login/staff', [AuthController::class, 'loginStaff']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware('api')->group(function () {
    Route::prefix('ninos')->group(function () {
        Route::get('/', [NinoController::class, 'index']);
        Route::post('/', [NinoController::class, 'store']);
        Route::get('/{id}', [NinoController::class, 'show']);
        Route::put('/{id}', [NinoController::class, 'update']);
        Route::delete('/{id}', [NinoController::class, 'destroy']);
        Route::post('/{id}/asignar-grupo', [NinoController::class, 'asignarGrupo']);
        Route::delete('/{id}/remover-grupo', [NinoController::class, 'removerGrupo']);
    });

    Route::prefix('grupos')->group(function () {
        Route::get('/', [GrupoController::class, 'index']);
        Route::post('/', [GrupoController::class, 'store']);
        Route::get('/{id}', [GrupoController::class, 'show']);
        Route::put('/{id}', [GrupoController::class, 'update']);
        Route::delete('/{id}', [GrupoController::class, 'destroy']);
    });
});
