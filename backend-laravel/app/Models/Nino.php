<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nino extends Model
{
    protected $table = 'tbl_nin_ninos';
    protected $primaryKey = 'nin_id';
    public $timestamps = false;

    protected $fillable = [
        'nin_nombre',
        'nin_apellido',
        'nin_fecha_nacimiento',
        'nin_edad',
        'nin_genero',
        'nin_tutor_legal',
        'nin_foto',
        'nin_alergias',
        'nin_medicamentos',
        'nin_observaciones',
        'nin_estado'
    ];

    protected $dates = [
        'nin_fecha_nacimiento',
        'nin_fecha_inscripcion'
    ];

    public function asignacionActual()
    {
        return $this->hasOne(AsignacionNino::class, 'asn_nin_id', 'nin_id')
                    ->whereNull('asn_fecha_baja')
                    ->where('asn_estado', 'activo');
    }

    public function asignaciones()
    {
        return $this->hasMany(AsignacionNino::class, 'asn_nin_id', 'nin_id');
    }
}