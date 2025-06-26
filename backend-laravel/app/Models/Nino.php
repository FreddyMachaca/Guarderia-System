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

    public function relacionesPadres()
    {
        return $this->hasMany(RelacionPadreNino::class, 'rel_nin_id', 'nin_id');
    }

    public function padres()
    {
        return $this->belongsToMany(Padre::class, 'tbl_rel_padres_ninos', 'rel_nin_id', 'rel_pdr_id')
                    ->withPivot('rel_parentesco');
    }

    public function getTutorLegalAttribute()
    {
        $relacion = $this->relacionesPadres()
                         ->with(['padre.usuario'])
                         ->first();
        
        if ($relacion && $relacion->padre && $relacion->padre->usuario) {
            return [
                'id' => $relacion->padre->pdr_id,
                'nombre_completo' => $relacion->padre->usuario->usr_nombre . ' ' . $relacion->padre->usuario->usr_apellido,
                'parentesco' => $relacion->rel_parentesco,
                'email' => $relacion->padre->usuario->usr_email,
                'telefono' => $relacion->padre->usuario->usr_telefono,
                'direccion' => $relacion->padre->pdr_direccion,
                'ci' => $relacion->padre->pdr_ci,
                'ci_ext' => $relacion->padre->pdr_ci_ext,
                'contacto_emergencia' => $relacion->padre->pdr_contacto_emergencia,
                'ocupacion' => $relacion->padre->pdr_ocupacion
            ];
        }
        
        return null;
    }

    public function getPrimerTutorAttribute()
    {
        $relacion = $this->relacionesPadres()
                         ->with(['padre.usuario'])
                         ->first();
        
        if ($relacion && $relacion->padre && $relacion->padre->usuario) {
            return [
                'pdr_id' => $relacion->padre->pdr_id,
                'parentesco' => $relacion->rel_parentesco,
                'nombre_completo' => $relacion->padre->usuario->usr_nombre . ' ' . $relacion->padre->usuario->usr_apellido
            ];
        }
        
        return null;
    }
}