<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    use HasFactory;

    protected $table = 'tbl_prs_personal';
    protected $primaryKey = 'prs_id';
    public $timestamps = false;

    protected $fillable = [
        'prs_usr_id',
        'prs_codigo_empleado',
        'prs_cargo',
        'prs_fecha_ingreso',
        'prs_salario',
        'prs_horario',
        'prs_fecha_registro'
    ];

    protected $dates = [
        'prs_fecha_ingreso',
        'prs_fecha_registro'
    ];
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'prs_usr_id', 'usr_id');
    }

    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'grp_responsable_id', 'prs_id');
    }

    public function nombreCompleto()
    {
        if ($this->usuario) {
            return $this->usuario->usr_nombre . ' ' . $this->usuario->usr_apellido;
        }
        return 'Sin nombre';
    }

    public function getNombreCompletoAttribute()
    {
        return $this->nombreCompleto();
    }
}
