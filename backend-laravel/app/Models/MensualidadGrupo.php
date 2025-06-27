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
        return $this->mensualidadesNinos()
                    ->where('mnc_estado_pago', 'pagado')
                    ->sum('mnc_monto_pagado');
    }

    public function getTotalPendienteAttribute()
    {
        return $this->mensualidadesNinos()
                    ->where('mnc_estado_pago', 'pendiente')
                    ->sum('mnc_precio_final');
    }

    public function getCantidadNinosAttribute()
    {
        return $this->mensualidadesNinos()->count();
    }
}
