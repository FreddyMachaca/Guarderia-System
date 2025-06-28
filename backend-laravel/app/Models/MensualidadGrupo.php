<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MensualidadGrupo extends Model
{
    protected $table = 'tbl_msg_mensualidades_grupo';
    protected $primaryKey = 'msg_id';
    public $timestamps = false;

    protected $fillable = [
        'msg_grp_id',
        'msg_precio_base',
        'msg_mes',
        'msg_anio',
        'msg_estado',
        'msg_fecha_vencimiento',
        'msg_observaciones'
    ];

    protected $dates = [
        'msg_fecha_creacion',
        'msg_fecha_vencimiento'
    ];

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'msg_grp_id', 'grp_id');
    }

    public function mensualidadesNinos()
    {
        return $this->hasMany(MensualidadNino::class, 'mnc_msg_id', 'msg_id');
    }

    public function getTotalRecaudadoAttribute()
    {
        return $this->mensualidadesNinos()->sum('mnc_monto_pagado');
    }

    public function getTotalPendienteAttribute()
    {
        return $this->mensualidadesNinos()
                    ->selectRaw('SUM(mnc_precio_final - COALESCE(mnc_monto_pagado, 0)) as pendiente')
                    ->value('pendiente') ?: 0;
    }

    public function getPrecioTotalRealAttribute()
    {
        return $this->mensualidadesNinos()->sum('mnc_precio_final');
    }

    public function getPorcentajeCobradoAttribute()
    {
        $precioTotalReal = $this->precio_total_real;
        $totalRecaudado = $this->total_recaudado;
        
        return $precioTotalReal > 0 ? round(($totalRecaudado / $precioTotalReal) * 100, 1) : 0;
    }

    public function getCantidadNinosAttribute()
    {
        return $this->mensualidadesNinos()->count();
    }

    public function getNinosActivosGrupoAttribute()
    {
        return AsignacionNino::where('asn_grp_id', $this->msg_grp_id)
                            ->where('asn_estado', 'activo')
                            ->whereNull('asn_fecha_baja')
                            ->count();
    }

    public function getNecesitaSincronizacionAttribute()
    {
        return $this->ninos_activos_grupo > $this->cantidad_ninos;
    }
}
