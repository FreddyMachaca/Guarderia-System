<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $titulo }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #7f8c8d;
        }
        .info-section {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background-color: #3498db;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-card.success {
            background-color: #27ae60;
        }
        .stat-card.warning {
            background-color: #f39c12;
        }
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 11px;
            opacity: 0.9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: white;
        }
        th {
            background-color: #34495e;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #ecf0f1;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .money {
            font-weight: bold;
            color: #27ae60;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $titulo }}</h1>
        <p>Sistema de Gestión de Guardería</p>
        <p>Período: {{ date('d/m/Y', strtotime($fecha_inicio)) }} - {{ date('d/m/Y', strtotime($fecha_fin)) }}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card success">
            <div class="stat-value">Bs {{ number_format($total_ingresos, 2) }}</div>
            <div class="stat-label">TOTAL INGRESOS</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $ingresos->count() }}</div>
            <div class="stat-label">TOTAL TRANSACCIONES</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">Bs {{ $ingresos->count() > 0 ? number_format($total_ingresos / $ingresos->count(), 2) : '0.00' }}</div>
            <div class="stat-label">PROMEDIO POR TRANSACCIÓN</div>
        </div>
    </div>

    @if($ingresos_por_metodo->count() > 0)
    <div class="info-section">
        <h3 style="margin-top: 0; color: #2c3e50;">Ingresos por Método de Pago</h3>
        @foreach($ingresos_por_metodo as $metodo => $monto)
        <div class="info-row">
            <span><strong>{{ ucfirst($metodo) }}:</strong></span>
            <span class="money">Bs {{ number_format($monto, 2) }}</span>
        </div>
        @endforeach
    </div>
    @endif

    <h3 style="color: #2c3e50; margin-bottom: 15px;">Detalle de Ingresos</h3>
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Niño</th>
                <th>Grupo</th>
                <th>Método</th>
                <th class="text-right">Monto</th>
                <th>Recibo</th>
            </tr>
        </thead>
        <tbody>
            @foreach($ingresos as $ingreso)
            <tr>
                <td>{{ date('d/m/Y', strtotime($ingreso->pgm_fecha_pago)) }}</td>
                <td>{{ $ingreso->mensualidadNino->nino->nin_nombre }} {{ $ingreso->mensualidadNino->nino->nin_apellido }}</td>
                <td>{{ $ingreso->mensualidadNino->mensualidadGrupo->grupo->grp_nombre }}</td>
                <td>{{ ucfirst($ingreso->pgm_metodo_pago) }}</td>
                <td class="text-right money">Bs {{ number_format($ingreso->pgm_monto, 2) }}</td>
                <td>{{ $ingreso->pgm_numero_recibo ?: 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #2c3e50; color: white;">
                <td colspan="4"><strong>TOTAL GENERAL</strong></td>
                <td class="text-right"><strong>Bs {{ number_format($total_ingresos, 2) }}</strong></td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Reporte generado el {{ $fecha_generacion }} | Sistema de Gestión de Guardería</p>
    </div>
</body>
</html>
