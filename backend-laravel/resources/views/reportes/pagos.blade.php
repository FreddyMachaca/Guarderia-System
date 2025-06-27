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
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
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
        .stat-card.danger {
            background-color: #e74c3c;
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
        .pending {
            color: #f39c12;
            font-weight: bold;
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
        <div class="stat-card">
            <div class="stat-value">{{ $estadisticas['total_mensualidades'] }}</div>
            <div class="stat-label">TOTAL MENSUALIDADES</div>
        </div>
        <div class="stat-card success">
            <div class="stat-value">{{ $estadisticas['pagadas'] }}</div>
            <div class="stat-label">PAGADAS</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">{{ $estadisticas['pendientes'] }}</div>
            <div class="stat-label">PENDIENTES</div>
        </div>
        <div class="stat-card danger">
            <div class="stat-value">{{ $estadisticas['vencidas'] }}</div>
            <div class="stat-label">VENCIDAS</div>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card success">
            <div class="stat-value">Bs {{ number_format($estadisticas['monto_total'], 2) }}</div>
            <div class="stat-label">MONTO TOTAL</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">Bs {{ number_format($estadisticas['monto_pagado'], 2) }}</div>
            <div class="stat-label">MONTO PAGADO</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">Bs {{ number_format($estadisticas['monto_pendiente'], 2) }}</div>
            <div class="stat-label">MONTO PENDIENTE</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $estadisticas['monto_total'] > 0 ? number_format(($estadisticas['monto_pagado'] / $estadisticas['monto_total']) * 100, 1) : 0 }}%</div>
            <div class="stat-label">% RECAUDADO</div>
        </div>
    </div>

    <h3 style="color: #2c3e50; margin-bottom: 15px;">Detalle de Mensualidades</h3>
    <table>
        <thead>
            <tr>
                <th>Niño</th>
                <th>Grupo</th>
                <th>Mes/Año</th>
                <th>Precio Final</th>
                <th>Pagado</th>
                <th>Pendiente</th>
                <th>Estado</th>
                <th>Fecha Pago</th>
            </tr>
        </thead>
        <tbody>
            @foreach($mensualidades as $mensualidad)
            <tr>
                <td>{{ $mensualidad->nino->nin_nombre }} {{ $mensualidad->nino->nin_apellido }}</td>
                <td>{{ $mensualidad->mensualidadGrupo->grupo->grp_nombre }}</td>
                <td class="text-center">{{ $mensualidad->mensualidadGrupo->msg_mes }}/{{ $mensualidad->mensualidadGrupo->msg_anio }}</td>
                <td class="text-right money">Bs {{ number_format($mensualidad->mnc_precio_final, 2) }}</td>
                <td class="text-right money">Bs {{ number_format($mensualidad->mnc_monto_pagado, 2) }}</td>
                <td class="text-right pending">Bs {{ number_format($mensualidad->mnc_precio_final - $mensualidad->mnc_monto_pagado, 2) }}</td>
                <td class="text-center">{{ ucfirst($mensualidad->mnc_estado_pago) }}</td>
                <td class="text-center">{{ $mensualidad->mnc_fecha_pago ? date('d/m/Y', strtotime($mensualidad->mnc_fecha_pago)) : 'Sin pago' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte generado el {{ $fecha_generacion }} | Sistema de Gestión de Guardería</p>
    </div>
</body>
</html>
