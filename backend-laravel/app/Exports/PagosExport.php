<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Events\AfterSheet;

class PagosExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths, WithEvents
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data['mensualidades']->map(function($mensualidad) {
            $saldoPendiente = $mensualidad->mnc_precio_final - ($mensualidad->mnc_monto_pagado ?: 0);
            return [
                'Niño' => $mensualidad->nino->nin_nombre . ' ' . $mensualidad->nino->nin_apellido,
                'Grupo' => $mensualidad->mensualidadGrupo->grupo->grp_nombre,
                'Período' => $mensualidad->mensualidadGrupo->msg_mes . '/' . $mensualidad->mensualidadGrupo->msg_anio,
                'Precio Final' => $mensualidad->mnc_precio_final,
                'Descuento' => $mensualidad->mnc_descuento ?: 0,
                'Monto Pagado' => $mensualidad->mnc_monto_pagado ?: 0,
                'Saldo Pendiente' => $saldoPendiente,
                'Estado de Pago' => ucfirst($mensualidad->mnc_estado_pago),
                'Fecha de Pago' => $mensualidad->mnc_fecha_pago ?: 'Pendiente',
                'Método de Pago' => $mensualidad->mnc_metodo_pago ? ucfirst($mensualidad->mnc_metodo_pago) : 'N/A',
                'Número de Recibo' => $mensualidad->mnc_numero_recibo ?: 'N/A',
                'Observaciones' => $mensualidad->mnc_observaciones ?: ''
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Niño',
            'Grupo',
            'Período',
            'Precio Final (Bs)',
            'Descuento (Bs)',
            'Monto Pagado (Bs)',
            'Saldo Pendiente (Bs)',
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
            // Estilo del encabezado
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '9B59B6']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ]
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,  // Niño
            'B' => 20,  // Grupo
            'C' => 12,  // Período
            'D' => 15,  // Precio Final
            'E' => 12,  // Descuento
            'F' => 15,  // Monto Pagado
            'G' => 15,  // Saldo Pendiente
            'H' => 15,  // Estado de Pago
            'I' => 15,  // Fecha de Pago
            'J' => 15,  // Método de Pago
            'K' => 18,  // Número de Recibo
            'L' => 25   // Observaciones
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->data['mensualidades']->count() + 1;

                // Aplicar bordes a toda la tabla
                $sheet->getStyle("A1:L{$lastRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('BDC3C7'));

                // Formatear columnas de moneda
                $sheet->getStyle("D2:F{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('#,##0.00');

                // Centrar período, fechas y métodos
                $sheet->getStyle("C2:C{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("G2:I{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Alternar colores de filas
                for ($i = 2; $i <= $lastRow; $i++) {
                    if ($i % 2 == 0) {
                        $sheet->getStyle("A{$i}:L{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('F4F1F8');
                    }
                }

                // Colorear estado de pago
                for ($i = 2; $i <= $lastRow; $i++) {
                    $estado = strtolower($sheet->getCell("G{$i}")->getValue());
                    switch ($estado) {
                        case 'pagado':
                            $sheet->getStyle("G{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('27AE60');
                            $sheet->getStyle("G{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                        case 'pendiente':
                            $sheet->getStyle("G{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('F39C12');
                            $sheet->getStyle("G{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                        case 'vencido':
                            $sheet->getStyle("G{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('E74C3C');
                            $sheet->getStyle("G{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                    }
                }

                // Ajustar altura de filas
                $sheet->getDefaultRowDimension()->setRowHeight(20);
                $sheet->getRowDimension(1)->setRowHeight(25);
            }
        ];
    }

    public function title(): string
    {
        return 'Reporte de Pagos';
    }
}
