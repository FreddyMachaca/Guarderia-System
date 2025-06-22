<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
    });
});

Route::middleware(['api', 'auth:sanctum'])->group(function () {
    
});
