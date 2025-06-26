<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Padre extends Model
{
    protected $table = 'tbl_pdr_padres';
    protected $primaryKey = 'pdr_id';
    public $timestamps = false;

    protected $fillable = [
        'pdr_usr_id',
        'pdr_direccion',
        'pdr_ocupacion',
        'pdr_contacto_emergencia',
        'pdr_ci',
        'pdr_ci_ext',
        'pdr_estado'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'pdr_usr_id', 'usr_id');
    }

    public function relacionesNinos()
    {
        return $this->hasMany(RelacionPadreNino::class, 'rel_pdr_id', 'pdr_id');
    }

    public function ninos()
    {
        return $this->belongsToMany(Nino::class, 'tbl_rel_padres_ninos', 'rel_pdr_id', 'rel_nin_id')
                    ->withPivot('rel_parentesco');
    }
}