<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MensualidadNino extends Model
{
    protected $table = 'tbl_mnc_mensualidades_nino';
    protected $primaryKey = 'mnc_id';
    public $timestamps = false;

    protected $fillable = [
        'mnc_msg_id',
        'mnc_nin_id',
        'mnc_precio_final',
        'mnc_descuento',
        'mnc_monto_pagado',
        'mnc_estado_pago',
        'mnc_fecha_pago',
        'mnc_metodo_pago',
        'mnc_numero_recibo',
        'mnc_observaciones'
    ];

    protected $dates = [
        'mnc_fecha_pago',
        'mnc_fecha_creacion'
    ];

    public function mensualidadGrupo()
    {
        return $this->belongsTo(MensualidadGrupo::class, 'mnc_msg_id', 'msg_id');
    }

    public function nino()
    {
        return $this->belongsTo(Nino::class, 'mnc_nin_id', 'nin_id');
    }

    public function pagos()
    {
        return $this->hasMany(PagoMensualidad::class, 'pgm_mnc_id', 'mnc_id');
    }

    public function getSaldoPendienteAttribute()
    {
        return $this->mnc_precio_final - ($this->mnc_monto_pagado ?? 0);
    }

    public function getEstaVencidaAttribute()
    {
        if ($this->mnc_estado_pago === 'pagado') {
            return false;
        }
        
        return $this->mensualidadGrupo->msg_fecha_vencimiento < now()->toDateString();
    }
}
