<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithDrawings;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Events\AfterSheet;

class IngresosExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths, WithEvents
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        $collection = collect();
        $collection->push(['REPORTE DE INGRESOS', '', '', '', '', '', '']);
        $collection->push(['Período:', $this->data['fecha_inicio'] . ' al ' . $this->data['fecha_fin'], '', '', '', '', '']);
        $collection->push(['Total de Transacciones:', $this->data['ingresos']->count(), '', '', '', '', '']);
        $collection->push(['Total de Ingresos:', 'Bs ' . number_format($this->data['total_ingresos'], 2), '', '', '', '', '']);
        $collection->push(['Promedio por Transacción:', 'Bs ' . number_format($this->data['ingresos']->count() > 0 ? $this->data['total_ingresos'] / $this->data['ingresos']->count() : 0, 2), '', '', '', '', '']);
        $collection->push(['', '', '', '', '', '', '']);
        $collection->push(['Fecha', 'Niño', 'Grupo', 'Método de Pago', 'Monto (Bs)', 'Número de Recibo', 'Observaciones']);
        
        foreach($this->data['ingresos'] as $ingreso) {
            $collection->push([
                $ingreso->pgm_fecha_pago,
                $ingreso->mensualidadNino->nino->nin_nombre . ' ' . $ingreso->mensualidadNino->nino->nin_apellido,
                $ingreso->mensualidadNino->mensualidadGrupo->grupo->grp_nombre,
                ucfirst($ingreso->pgm_metodo_pago),
                $ingreso->pgm_monto,
                $ingreso->pgm_numero_recibo ?: 'N/A',
                $ingreso->pgm_observaciones ?: ''
            ]);
        }

        $collection->push([
            '', '', '', 'TOTAL GENERAL', $this->data['total_ingresos'], '', ''
        ]);

        return $collection;
    }

    public function headings(): array
    {
        return []; 
    }

    public function styles(Worksheet $sheet)
    {
        $headerRow = 7;
        $lastDataRow = 7 + $this->data['ingresos']->count();
        $totalRow = $lastDataRow + 1;

        return [
            // Título principal
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 16,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2980B9']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ],
            // Estilo para filas de información
            '2:5' => [
                'font' => [
                    'bold' => true,
                    'size' => 11
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'EBF3FD']
                ]
            ],
            // Encabezados de la tabla
            $headerRow => [
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
            ],
            // Fila de total
            $totalRow => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '27AE60']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER
                ]
            ]
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,  // Fecha
            'B' => 30,  // Niño
            'C' => 22,  // Grupo
            'D' => 18,  // Método de Pago
            'E' => 18,  // Monto
            'F' => 20,  // Número de Recibo
            'G' => 35   // Observaciones
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $headerRow = 7;
                $lastDataRow = 7 + $this->data['ingresos']->count();
                $totalRow = $lastDataRow + 1;

                // Combinar celdas para el título
                $sheet->mergeCells('A1:G1');
                
                // Formatear fechas en la información
                $sheet->getCell('B2')->setValue('Período: ' . date('d/m/Y', strtotime($this->data['fecha_inicio'])) . ' al ' . date('d/m/Y', strtotime($this->data['fecha_fin'])));

                // Aplicar bordes a la tabla de datos
                $sheet->getStyle("A{$headerRow}:G{$totalRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('BDC3C7'));

                // Formatear columna de monto como moneda
                $sheet->getStyle("E" . ($headerRow + 1) . ":E{$totalRow}")
                    ->getNumberFormat()
                    ->setFormatCode('#,##0.00');

                // Centrar fechas y alinear montos
                $sheet->getStyle("A" . ($headerRow + 1) . ":A{$lastDataRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("E" . ($headerRow + 1) . ":E{$totalRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Alternar colores de filas en los datos
                for ($i = $headerRow + 1; $i <= $lastDataRow; $i++) {
                    if (($i - $headerRow) % 2 == 0) {
                        $sheet->getStyle("A{$i}:G{$i}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('F8F9FA');
                    }
                }

                // Colorear métodos de pago
                for ($i = $headerRow + 1; $i <= $lastDataRow; $i++) {
                    $metodo = strtolower($sheet->getCell("D{$i}")->getValue());
                    switch($metodo) {
                        case 'efectivo':
                            $sheet->getStyle("D{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('F39C12');
                            $sheet->getStyle("D{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                        case 'transferencia':
                            $sheet->getStyle("D{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('3498DB');
                            $sheet->getStyle("D{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                        case 'qr':
                            $sheet->getStyle("D{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('9B59B6');
                            $sheet->getStyle("D{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                        default:
                            $sheet->getStyle("D{$i}")
                                ->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()
                                ->setRGB('95A5A6');
                            $sheet->getStyle("D{$i}")
                                ->getFont()
                                ->getColor()
                                ->setRGB('FFFFFF');
                            break;
                    }
                }

                // Ajustar altura de filas
                $sheet->getDefaultRowDimension()->setRowHeight(22);
                $sheet->getRowDimension(1)->setRowHeight(30);
                $sheet->getRowDimension($headerRow)->setRowHeight(25);
                $sheet->getRowDimension($totalRow)->setRowHeight(25);

                // Añadir estadísticas por método de pago si existen
                if ($this->data['ingresos_por_metodo']->count() > 0) {
                    $statsStartRow = $totalRow + 3;
                    $sheet->setCellValue("A{$statsStartRow}", "RESUMEN POR MÉTODO DE PAGO");
                    $sheet->getStyle("A{$statsStartRow}:B{$statsStartRow}")
                        ->getFont()
                        ->setBold(true);
                    $sheet->getStyle("A{$statsStartRow}:B{$statsStartRow}")
                        ->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()
                        ->setRGB('E8F4FD');
                    
                    $currentRow = $statsStartRow + 1;
                    foreach($this->data['ingresos_por_metodo'] as $metodo => $monto) {
                        $sheet->setCellValue("A{$currentRow}", ucfirst($metodo));
                        $sheet->setCellValue("B{$currentRow}", 'Bs ' . number_format($monto, 2));
                        $currentRow++;
                    }
                }
            }
        ];
    }

    public function title(): string
    {
        return 'Reporte de Ingresos';
    }
}
