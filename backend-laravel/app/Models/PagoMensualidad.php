<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoMensualidad extends Model
{
    protected $table = 'tbl_pgm_pagos_mensualidad';
    protected $primaryKey = 'pgm_id';
    public $timestamps = false;

    protected $fillable = [
        'pgm_mnc_id',
        'pgm_monto',
        'pgm_fecha_pago',
        'pgm_metodo_pago',
        'pgm_numero_recibo',
        'pgm_observaciones',
        'pgm_registrado_por'
    ];

    protected $dates = [
        'pgm_fecha_pago',
        'pgm_fecha_registro'
    ];

    public function mensualidadNino()
    {
        return $this->belongsTo(MensualidadNino::class, 'pgm_mnc_id', 'mnc_id');
    }

    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'pgm_registrado_por', 'usr_id');
    }
}
