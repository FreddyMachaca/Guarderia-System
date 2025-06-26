<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RelacionPadreNino extends Model
{
    protected $table = 'tbl_rel_padres_ninos';
    protected $primaryKey = 'rel_id';
    public $timestamps = false;

    protected $fillable = [
        'rel_pdr_id',
        'rel_nin_id',
        'rel_parentesco'
    ];

    public function padre()
    {
        return $this->belongsTo(Padre::class, 'rel_pdr_id', 'pdr_id');
    }

    public function nino()
    {
        return $this->belongsTo(Nino::class, 'rel_nin_id', 'nin_id');
    }
}
