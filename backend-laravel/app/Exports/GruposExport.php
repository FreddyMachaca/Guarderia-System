<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GruposExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data['estadisticas']->map(function($estadistica) {
            $grupo = $estadistica['grupo'];
            return [
                'Nombre del Grupo' => $grupo->grp_nombre,
                'Descripción' => $grupo->grp_descripcion,
                'Edad Mínima' => $grupo->grp_edad_minima,
                'Edad Máxima' => $grupo->grp_edad_maxima,
                'Capacidad Total' => $grupo->grp_capacidad,
                'Niños Activos' => $estadistica['ninos_activos'],
                'Capacidad Disponible' => $estadistica['capacidad_disponible'],
                'Capacidad Utilizada (%)' => $estadistica['capacidad_utilizada'],
                'Responsable' => $grupo->responsable->usuario->usr_nombre . ' ' . $grupo->responsable->usuario->usr_apellido,
                'Estado' => $grupo->grp_estado
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Nombre del Grupo',
            'Descripción',
            'Edad Mínima',
            'Edad Máxima',
            'Capacidad Total',
            'Niños Activos',
            'Capacidad Disponible',
            'Capacidad Utilizada (%)',
            'Responsable',
            'Estado'
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
        return 'Reporte de Grupos';
    }
}
