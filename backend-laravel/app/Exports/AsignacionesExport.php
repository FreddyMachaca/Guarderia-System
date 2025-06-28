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
use Maatwebsite\Excel\Events\AfterSheet;

class AsignacionesExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths, WithEvents
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
                'Fecha de Baja' => $asignacion->asn_fecha_baja ?: 'Activo',
                'Estado' => ucfirst($asignacion->asn_estado),
                'Observaciones' => $asignacion->asn_observaciones ?: ''
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
            // Estilo del encabezado
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '34495E']
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
            'C' => 18,  // Fecha de Asignación
            'D' => 18,  // Fecha de Baja
            'E' => 12,  // Estado
            'F' => 30   // Observaciones
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->data['asignaciones']->count() + 1;

                // Aplicar bordes a toda la tabla
                $sheet->getStyle("A1:F{$lastRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('BDC3C7'));

                // Centrar fechas y estado
                $sheet->getStyle("C2:E{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Alternar colores de filas
                for ($i = 2; $i <= $lastRow; $i++) {
                    if ($i % 2 == 0) {
                        $sheet->getStyle("A{$i}:F{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('ECF0F1');
                    }
                }

                // Colorear estado
                for ($i = 2; $i <= $lastRow; $i++) {
                    $estado = strtolower($sheet->getCell("E{$i}")->getValue());
                    if ($estado === 'activo') {
                        $sheet->getStyle("E{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('27AE60');
                        $sheet->getStyle("E{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('FFFFFF');
                    } else {
                        $sheet->getStyle("E{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('95A5A6');
                        $sheet->getStyle("E{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('FFFFFF');
                    }

                    // Colorear fecha de baja si no está activo
                    $fechaBaja = $sheet->getCell("D{$i}")->getValue();
                    if ($fechaBaja !== 'Activo') {
                        $sheet->getStyle("D{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('E74C3C');
                    } else {
                        $sheet->getStyle("D{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('27AE60');
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
        return 'Reporte de Asignaciones';
    }
}
