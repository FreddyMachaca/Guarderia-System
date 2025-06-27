<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AsignacionesExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data['asignaciones']->map(function($asignacion) {
            return [
                'Niño' => $asignacion->nino->nin_nombre . ' ' . $asignacion->nino->nin_apellido,
                'Grupo' => $asignacion->grupo->grp_nombre,
                'Fecha de Asignación' => $asignacion->asn_fecha_asignacion,
                'Fecha de Baja' => $asignacion->asn_fecha_baja,
                'Estado' => $asignacion->asn_estado,
                'Observaciones' => $asignacion->asn_observaciones
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Niño',
            'Grupo',
            'Fecha de Asignación',
            'Fecha de Baja',
            'Estado',
            'Observaciones'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Reporte de Asignaciones';
    }
}
