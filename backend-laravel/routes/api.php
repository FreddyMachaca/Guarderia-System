<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NinoController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\AsignacionNinoController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\PadreController;
use App\Http\Controllers\MensualidadController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MisHijosController;

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
        Route::get('/current-user-id', [AuthController::class, 'getCurrentUserId']);
    });
});

Route::middleware(['api', 'api.throttle', 'check.user.type:admin,personal'])->group(function () {
    
    Route::prefix('ninos')->group(function () {
        Route::get('/', [NinoController::class, 'index']);
        Route::post('/', [NinoController::class, 'store']);
        Route::get('/padres-disponibles', [NinoController::class, 'getPadresDisponibles']);
        Route::get('/{id}', [NinoController::class, 'show']);
        Route::put('/{id}', [NinoController::class, 'update']);
        Route::delete('/{id}', [NinoController::class, 'destroy']);
        Route::put('/{id}/activar', [NinoController::class, 'activar']);
        Route::post('/{id}/asignar-grupo', [NinoController::class, 'asignarGrupo']);
        Route::delete('/{id}/remover-grupo', [NinoController::class, 'removerGrupo']);
    });

    // Rutas para el módulo de Padres/Tutores
    Route::prefix('padres')->group(function () {
        Route::get('/', [PadreController::class, 'index']);
        Route::post('/', [PadreController::class, 'store']);
        Route::get('/{id}', [PadreController::class, 'show']);
        Route::put('/{id}', [PadreController::class, 'update']);
        Route::delete('/{id}', [PadreController::class, 'destroy']);
        Route::put('/{id}/reset-password', [PadreController::class, 'resetPassword']);
        Route::put('/{id}/activar', [PadreController::class, 'activar']);
    });

    // Rutas para el módulo de Grupos/Aulas
    Route::group(['prefix' => 'grupos'], function () {

        // Rutas para grupos
        Route::get('/', [GrupoController::class, 'index']);
        Route::post('/', [GrupoController::class, 'store']);
        Route::get('/{id}', [GrupoController::class, 'show']);
        Route::put('/{id}', [GrupoController::class, 'update']);
        Route::delete('/{id}', [GrupoController::class, 'destroy']);
        Route::put('/{id}/activar', [GrupoController::class, 'activar']);
        Route::put('/{id}/desactivar', [GrupoController::class, 'desactivar']);
        Route::get('/responsables/lista', [GrupoController::class, 'getResponsables']);
        
        // Rutas para asignaciones
        Route::get('/{grupoId}/ninos', [AsignacionNinoController::class, 'listarNinosPorGrupo']);
        Route::post('/asignar-nino', [AsignacionNinoController::class, 'asignarNino']);
        Route::put('/asignaciones/{asignacionId}/baja', [AsignacionNinoController::class, 'darDeBaja']);
        Route::get('/ninos/disponibles', [AsignacionNinoController::class, 'getNinosDisponibles']);
        
        // Rutas para grupos y niños
        Route::get('grupos/{id}/ninos', [GrupoController::class, 'getNinosPorGrupo']);
    });

    // Rutas para el módulo de Personal
    Route::prefix('personal')->group(function () {
        Route::get('/', [PersonalController::class, 'index']);
        Route::post('/', [PersonalController::class, 'store']);
        Route::get('/lista', [PersonalController::class, 'listaPersonal']);
        Route::get('/{id}', [PersonalController::class, 'show']);
        Route::put('/{id}', [PersonalController::class, 'update']);
        Route::delete('/{id}', [PersonalController::class, 'destroy']);
        Route::post('/{id}/reset-password', [PersonalController::class, 'resetPassword']);
        Route::put('/{id}/activar', [PersonalController::class, 'activar']); // Nueva ruta para activar personal
    });

    // Rutas para el módulo de Mensualidades
    Route::prefix('mensualidades')->group(function () {
        Route::get('/', [MensualidadController::class, 'index']);
        Route::post('/', [MensualidadController::class, 'store']);
        Route::get('/grupos', [MensualidadController::class, 'obtenerGrupos']);
        Route::get('/reporte', [MensualidadController::class, 'reporteMensual']);
        Route::get('/{id}', [MensualidadController::class, 'show']);
        Route::put('/{id}', [MensualidadController::class, 'update']);
        Route::delete('/{id}', [MensualidadController::class, 'destroy']);
        Route::put('/{mensualidadId}/nino/{ninoId}/precio', [MensualidadController::class, 'actualizarPrecioNino']);
        Route::post('/pago', [MensualidadController::class, 'registrarPago']);
        Route::post('/{id}/sincronizar-ninos', [MensualidadController::class, 'sincronizarNinos']);
        Route::get('/{id}/sincronizar-ninos', [MensualidadController::class, 'sincronizarNinos']);
        Route::get('/{id}/verificar-sincronizacion', [MensualidadController::class, 'verificarSincronizacion']);
        Route::put('/{id}/inactivar', [MensualidadController::class, 'inactivar']); 
        Route::put('/{id}/activar', [MensualidadController::class, 'activar']); // Nueva ruta para activar
    });

    // Rutas para reportes
    Route::prefix('reportes')->group(function () {
        Route::get('/ingresos', [App\Http\Controllers\ReporteController::class, 'reporteIngresos']);
        Route::get('/ninos-inscritos', [App\Http\Controllers\ReporteController::class, 'reporteNinosInscritos']);
        Route::get('/grupos', [App\Http\Controllers\ReporteController::class, 'reporteGrupos']);
        Route::get('/pagos', [App\Http\Controllers\ReporteController::class, 'reportePagos']);
        Route::get('/asignaciones', [App\Http\Controllers\ReporteController::class, 'reporteAsistencia']);
    });

    // Rutas para el módulo de Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/estadisticas-basicas', [DashboardController::class, 'estadisticasBasicas']);
        Route::get('/estadisticas', [DashboardController::class, 'estadisticas']);
        Route::get('/ingresos', [DashboardController::class, 'ingresos']);
        Route::get('/pagos-metodo', [DashboardController::class, 'pagosPorMetodo']);
        Route::get('/ninos-por-grupo', [DashboardController::class, 'ninosPorGrupo']);
        Route::get('/actividad-calendario', [DashboardController::class, 'actividadCalendario']);
        Route::get('/ninos', [DashboardController::class, 'ninos']);
    });
});

Route::middleware(['api', 'api.throttle', 'check.user.type:Tutor'])->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('/padre', [DashboardController::class, 'datosPadre']);
        Route::get('/padre-completo', [DashboardController::class, 'datosCompletoPadre']);
    });

    Route::prefix('perfil')->group(function () {
        Route::get('/', [App\Http\Controllers\PerfilController::class, 'show']);
        Route::put('/', [App\Http\Controllers\PerfilController::class, 'update']);
        Route::post('/foto', [App\Http\Controllers\PerfilController::class, 'updateFoto']);
    });

    // Rutas para Mis Hijos
    Route::prefix('mis-hijos')->group(function () {
        Route::get('/', [MisHijosController::class, 'index']);
        Route::get('/{id}', [MisHijosController::class, 'show']);
    });
});

Route::middleware(['api', 'api.throttle', 'check.user.type:admin,personal,Tutor'])->group(function () {
    Route::prefix('perfil')->group(function () {
        Route::get('/', [App\Http\Controllers\PerfilController::class, 'show']);
        Route::put('/', [App\Http\Controllers\PerfilController::class, 'update']);
        Route::post('/foto', [App\Http\Controllers\PerfilController::class, 'updateFoto']);
    });
});