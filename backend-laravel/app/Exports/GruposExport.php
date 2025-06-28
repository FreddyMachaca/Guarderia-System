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

class GruposExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths, WithEvents
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
                'Rango de Edad' => $grupo->grp_edad_minima . ' - ' . $grupo->grp_edad_maxima . ' años',
                'Capacidad Total' => $estadistica['grupo']->grp_capacidad,
                'Niños Activos' => $estadistica['ninos_activos'],
                'Capacidad Disponible' => $estadistica['capacidad_disponible'],
                'Utilización (%)' => $estadistica['capacidad_utilizada'] . '%',
                'Responsable' => $grupo->responsable->usuario->usr_nombre . ' ' . $grupo->responsable->usuario->usr_apellido,
                'Estado' => ucfirst($grupo->grp_estado)
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Nombre del Grupo',
            'Descripción',
            'Rango de Edad',
            'Capacidad Total',
            'Niños Activos',
            'Capacidad Disponible',
            'Utilización (%)',
            'Responsable',
            'Estado'
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
                    'startColor' => ['rgb' => 'F39C12']
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
            'A' => 20,  // Nombre del Grupo
            'B' => 30,  // Descripción
            'C' => 15,  // Rango de Edad
            'D' => 15,  // Capacidad Total
            'E' => 15,  // Niños Activos
            'F' => 18,  // Capacidad Disponible
            'G' => 15,  // Utilización (%)
            'H' => 25,  // Responsable
            'I' => 12   // Estado
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->data['estadisticas']->count() + 1;

                // Aplicar bordes a toda la tabla
                $sheet->getStyle("A1:I{$lastRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('BDC3C7'));

                // Centrar columnas numéricas
                $sheet->getStyle("C2:G{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("I2:I{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Alternar colores de filas
                for ($i = 2; $i <= $lastRow; $i++) {
                    if ($i % 2 == 0) {
                        $sheet->getStyle("A{$i}:I{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('FEF9E7');
                    }
                }

                // Colorear utilización según porcentaje
                for ($i = 2; $i <= $lastRow; $i++) {
                    $utilizacion = (float)str_replace('%', '', $sheet->getCell("G{$i}")->getValue());
                    if ($utilizacion >= 90) {
                        $sheet->getStyle("G{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('E74C3C');
                        $sheet->getStyle("G{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('FFFFFF');
                    } elseif ($utilizacion >= 70) {
                        $sheet->getStyle("G{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('F39C12');
                        $sheet->getStyle("G{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('FFFFFF');
                    } else {
                        $sheet->getStyle("G{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('27AE60');
                        $sheet->getStyle("G{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('FFFFFF');
                    }
                }

                // Colorear estado
                for ($i = 2; $i <= $lastRow; $i++) {
                    $estado = $sheet->getCell("I{$i}")->getValue();
                    if (strtolower($estado) === 'activo') {
                        $sheet->getStyle("I{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('27AE60');
                    } else {
                        $sheet->getStyle("I{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('E74C3C');
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
        return 'Reporte de Grupos';
    }
}
