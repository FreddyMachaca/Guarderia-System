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
        'grp_capacidad_maxima',
        'grp_edad_minima',
        'grp_edad_maxima',
        'grp_prs_responsable_id',
        'grp_estado'
    ];
}