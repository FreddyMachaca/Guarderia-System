<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'tbl_usr_usuarios';
    protected $primaryKey = 'usr_id';
    public $timestamps = false;

    protected $fillable = [
        'usr_nombre',
        'usr_apellido',
        'usr_email',
        'usr_password',
        'usr_telefono',
        'usr_tipo',
        'usr_estado'
    ];

    protected $hidden = [
        'usr_password',
    ];

    protected $casts = [
        'usr_fecha_creacion' => 'datetime',
        'usr_fecha_actualizacion' => 'datetime',
    ];

    public function personal()
    {
        return $this->hasOne(Personal::class, 'prs_usr_id', 'usr_id');
    }

    public function padre()
    {
        return $this->hasOne(Padre::class, 'pdr_usr_id', 'usr_id');
    }
}
