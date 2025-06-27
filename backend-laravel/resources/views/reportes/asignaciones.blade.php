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
            grid-template-columns: repeat(2, 1fr);
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
            <div class="stat-value">{{ $total_asignaciones }}</div>
            <div class="stat-label">TOTAL ASIGNACIONES</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $asignaciones_por_grupo->count() }}</div>
            <div class="stat-label">GRUPOS CON ASIGNACIONES</div>
        </div>
    </div>

    @if($asignaciones_por_grupo->count() > 0)
    <div class="info-section">
        <h3 style="margin-top: 0; color: #2c3e50;">Asignaciones por Grupo</h3>
        @foreach($asignaciones_por_grupo as $grupo => $asignaciones_grupo)
        <div class="info-row">
            <span><strong>{{ $grupo }}:</strong></span>
            <span>{{ $asignaciones_grupo->count() }} asignaciones</span>
        </div>
        @endforeach
    </div>
    @endif

    <h3 style="color: #2c3e50; margin-bottom: 15px;">Detalle de Asignaciones</h3>
    <table>
        <thead>
            <tr>
                <th>Niño</th>
                <th>Grupo</th>
                <th>Fecha Asignación</th>
                <th>Fecha Baja</th>
                <th>Estado</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            @foreach($asignaciones as $asignacion)
            <tr>
                <td>{{ $asignacion->nino->nin_nombre }} {{ $asignacion->nino->nin_apellido }}</td>
                <td>{{ $asignacion->grupo->grp_nombre }}</td>
                <td class="text-center">{{ date('d/m/Y', strtotime($asignacion->asn_fecha_asignacion)) }}</td>
                <td class="text-center">{{ $asignacion->asn_fecha_baja ? date('d/m/Y', strtotime($asignacion->asn_fecha_baja)) : 'N/A' }}</td>
                <td class="text-center">{{ ucfirst($asignacion->asn_estado) }}</td>
                <td>{{ $asignacion->asn_observaciones ?: 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte generado el {{ $fecha_generacion }} | Sistema de Gestión de Guardería</p>
    </div>
</body>
</html>
