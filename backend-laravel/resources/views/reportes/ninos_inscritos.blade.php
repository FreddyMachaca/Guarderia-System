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
            <div class="stat-value">{{ $total_ninos }}</div>
            <div class="stat-label">TOTAL NIÑOS INSCRITOS</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $ninos_por_genero->get('masculino', collect())->count() }}</div>
            <div class="stat-label">NIÑOS</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">{{ $ninos_por_genero->get('femenino', collect())->count() }}</div>
            <div class="stat-label">NIÑAS</div>
        </div>
    </div>

    @if($ninos_por_grupo->count() > 0)
    <div class="info-section">
        <h3 style="margin-top: 0; color: #2c3e50;">Distribución por Grupo</h3>
        @foreach($ninos_por_grupo as $grupo => $ninos_grupo)
        <div class="info-row">
            <span><strong>{{ $grupo }}:</strong></span>
            <span>{{ $ninos_grupo->count() }} niños</span>
        </div>
        @endforeach
    </div>
    @endif

    @if($ninos_por_edad->count() > 0)
    <div class="info-section">
        <h3 style="margin-top: 0; color: #2c3e50;">Distribución por Edad</h3>
        @foreach($ninos_por_edad->sortKeys() as $edad => $ninos_edad)
        <div class="info-row">
            <span><strong>{{ $edad }} años:</strong></span>
            <span>{{ $ninos_edad->count() }} niños</span>
        </div>
        @endforeach
    </div>
    @endif

    <h3 style="color: #2c3e50; margin-bottom: 15px;">Listado de Niños Inscritos</h3>
    <table>
        <thead>
            <tr>
                <th>Nombre Completo</th>
                <th>Edad</th>
                <th>Género</th>
                <th>Grupo</th>
                <th>Tutor</th>
                <th>Fecha Inscripción</th>
            </tr>
        </thead>
        <tbody>
            @foreach($ninos as $nino)
            <tr>
                <td>{{ $nino->nin_nombre }} {{ $nino->nin_apellido }}</td>
                <td class="text-center">{{ $nino->nin_edad }}</td>
                <td class="text-center">{{ ucfirst($nino->nin_genero) }}</td>
                <td>{{ $nino->asignacionActual ? $nino->asignacionActual->grupo->grp_nombre : 'Sin Grupo' }}</td>
                <td>
                    @if($nino->primer_tutor)
                        {{ $nino->primer_tutor['nombre_completo'] }}
                    @else
                        Sin Tutor
                    @endif
                </td>
                <td class="text-center">{{ date('d/m/Y', strtotime($nino->nin_fecha_inscripcion)) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte generado el {{ $fecha_generacion }} | Sistema de Gestión de Guardería</p>
    </div>
</body>
</html>
