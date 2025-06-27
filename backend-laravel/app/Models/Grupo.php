<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $table = 'tbl_grp_grupos';
    protected $primaryKey = 'grp_id';
    public $timestamps = false;

    protected $fillable = [
        'grp_nombre',
        'grp_descripcion',
        'grp_capacidad',
        'grp_edad_minima',
        'grp_edad_maxima',
        'grp_responsable_id',
        'grp_estado'
    ];

    protected $dates = [
        'grp_fecha_creacion',
        'grp_fecha_actualizacion'
    ];

    public function responsable()
    {
        return $this->belongsTo(Personal::class, 'grp_responsable_id', 'prs_id');
    }

    public function asignaciones()
    {
        return $this->hasMany(AsignacionNino::class, 'asn_grp_id', 'grp_id');
    }

    public function ninosActivos()
    {
        return $this->hasMany(AsignacionNino::class, 'asn_grp_id', 'grp_id')
                    ->whereNull('asn_fecha_baja')
                    ->where('asn_estado', 'activo');
    }

    public function asignacionesActivas()
    {
        return $this->hasMany(AsignacionNino::class, 'asn_grp_id', 'grp_id')
                    ->whereNull('asn_fecha_baja')
                    ->where('asn_estado', 'activo');
    }

    public function getCapacidadDisponibleAttribute()
    {
        $ninosAsignados = $this->ninosActivos()->count();
        return $this->grp_capacidad - $ninosAsignados;
    }
}
