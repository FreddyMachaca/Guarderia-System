<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PagosExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data['mensualidades']->map(function($mensualidad) {
            return [
                'Niño' => $mensualidad->nino->nin_nombre . ' ' . $mensualidad->nino->nin_apellido,
                'Grupo' => $mensualidad->mensualidadGrupo->grupo->grp_nombre,
                'Mes/Año' => $mensualidad->mensualidadGrupo->msg_mes . '/' . $mensualidad->mensualidadGrupo->msg_anio,
                'Precio Final' => $mensualidad->mnc_precio_final,
                'Descuento' => $mensualidad->mnc_descuento,
                'Monto Pagado' => $mensualidad->mnc_monto_pagado,
                'Estado de Pago' => $mensualidad->mnc_estado_pago,
                'Fecha de Pago' => $mensualidad->mnc_fecha_pago,
                'Método de Pago' => $mensualidad->mnc_metodo_pago,
                'Número de Recibo' => $mensualidad->mnc_numero_recibo,
                'Observaciones' => $mensualidad->mnc_observaciones
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Niño',
            'Grupo',
            'Mes/Año',
            'Precio Final',
            'Descuento',
            'Monto Pagado',
            'Estado de Pago',
            'Fecha de Pago',
            'Método de Pago',
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
        return 'Reporte de Pagos';
    }
}
