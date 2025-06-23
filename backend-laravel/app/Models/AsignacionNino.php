<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionNino extends Model
{
    protected $table = 'tbl_asn_asignaciones_ninos';
    protected $primaryKey = 'asn_id';
    public $timestamps = false;

    protected $fillable = [
        'asn_nin_id',
        'asn_grp_id',
        'asn_fecha_baja',
        'asn_estado',
        'asn_observaciones'
    ];

    protected $dates = [
        'asn_fecha_asignacion',
        'asn_fecha_baja'
    ];

    public function nino()
    {
        return $this->belongsTo(Nino::class, 'asn_nin_id', 'nin_id');
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'asn_grp_id', 'grp_id');
    }
}