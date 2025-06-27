<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class IngresosExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data['ingresos']->map(function($ingreso) {
            return [
                'Fecha' => $ingreso->pgm_fecha_pago,
                'Niño' => $ingreso->mensualidadNino->nino->nin_nombre . ' ' . $ingreso->mensualidadNino->nino->nin_apellido,
                'Grupo' => $ingreso->mensualidadNino->mensualidadGrupo->grupo->grp_nombre,
                'Método de Pago' => $ingreso->pgm_metodo_pago,
                'Monto' => $ingreso->pgm_monto,
                'Número de Recibo' => $ingreso->pgm_numero_recibo,
                'Observaciones' => $ingreso->pgm_observaciones
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Niño',
            'Grupo',
            'Método de Pago',
            'Monto',
            'Número de Recibo',
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
        return 'Reporte de Ingresos';
    }
}
