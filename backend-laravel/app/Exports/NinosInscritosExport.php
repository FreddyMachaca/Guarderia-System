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

class NinosInscritosExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithColumnWidths, WithEvents
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
                'Edad' => $nino->nin_edad . ' años',
                'Género' => ucfirst($nino->nin_genero),
                'Grupo' => $nino->asignacionActual ? $nino->asignacionActual->grupo->grp_nombre : 'Sin Grupo',
                'Tutor' => $tutor ? $tutor['nombre_completo'] : 'Sin Tutor',
                'Parentesco' => $tutor ? ucfirst($tutor['parentesco']) : '',
                'Fecha de Inscripción' => $nino->nin_fecha_inscripcion,
                'Estado' => ucfirst($nino->nin_estado)
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
            // Estilo del encabezado
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '3498DB']
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
            'A' => 25,  // Nombre Completo
            'B' => 18,  // Fecha de Nacimiento
            'C' => 8,   // Edad
            'D' => 12,  // Género
            'E' => 20,  // Grupo
            'F' => 25,  // Tutor
            'G' => 15,  // Parentesco
            'H' => 18,  // Fecha de Inscripción
            'I' => 12   // Estado
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $this->data['ninos']->count() + 1;

                // Aplicar bordes a toda la tabla
                $sheet->getStyle("A1:I{$lastRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('BDC3C7'));

                // Centrar fechas y edad
                $sheet->getStyle("B2:B{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                
                $sheet->getStyle("C2:C{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("H2:H{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Centrar género y estado
                $sheet->getStyle("D2:D{$lastRow}")
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
                            ->setRGB('EBF3FD');
                    }
                }

                // Colorear estado según valor
                for ($i = 2; $i <= $lastRow; $i++) {
                    $estado = $sheet->getCell("I{$i}")->getValue();
                    if (strtolower($estado) === 'activo') {
                        $sheet->getStyle("I{$i}")
                            ->getFont()
                            ->getColor()
                            ->setRGB('27AE60');
                    } elseif (strtolower($estado) === 'inactivo') {
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
        return 'Niños Inscritos';
    }
}
