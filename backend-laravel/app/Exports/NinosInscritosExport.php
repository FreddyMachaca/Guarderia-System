<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NinosInscritosExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data['ninos']->map(function($nino) {
            $tutor = $nino->primer_tutor;
            return [
                'Nombre Completo' => $nino->nin_nombre . ' ' . $nino->nin_apellido,
                'Fecha de Nacimiento' => $nino->nin_fecha_nacimiento,
                'Edad' => $nino->nin_edad,
                'Género' => $nino->nin_genero,
                'Grupo' => $nino->asignacionActual ? $nino->asignacionActual->grupo->grp_nombre : 'Sin Grupo',
                'Tutor' => $tutor ? $tutor['nombre_completo'] : 'Sin Tutor',
                'Parentesco' => $tutor ? $tutor['parentesco'] : '',
                'Fecha de Inscripción' => $nino->nin_fecha_inscripcion,
                'Estado' => $nino->nin_estado
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Nombre Completo',
            'Fecha de Nacimiento',
            'Edad',
            'Género',
            'Grupo',
            'Tutor',
            'Parentesco',
            'Fecha de Inscripción',
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
        return 'Niños Inscritos';
    }
}
