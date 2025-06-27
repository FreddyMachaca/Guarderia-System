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
        <p>Fecha de generación: {{ $fecha_generacion }}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card success">
            <div class="stat-value">{{ $total_grupos }}</div>
            <div class="stat-label">TOTAL GRUPOS ACTIVOS</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{{ $total_ninos }}</div>
            <div class="stat-label">TOTAL NIÑOS ASIGNADOS</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">{{ $estadisticas->sum('capacidad_disponible') }}</div>
            <div class="stat-label">CUPOS DISPONIBLES</div>
        </div>
    </div>

    <h3 style="color: #2c3e50; margin-bottom: 15px;">Detalle de Grupos</h3>
    <table>
        <thead>
            <tr>
                <th>Nombre del Grupo</th>
                <th>Edad Mín-Máx</th>
                <th>Capacidad</th>
                <th>Niños Activos</th>
                <th>Disponible</th>
                <th>% Utilizada</th>
                <th>Responsable</th>
            </tr>
        </thead>
        <tbody>
            @foreach($estadisticas as $estadistica)
            <tr>
                <td>{{ $estadistica['grupo']->grp_nombre }}</td>
                <td class="text-center">{{ $estadistica['grupo']->grp_edad_minima }}-{{ $estadistica['grupo']->grp_edad_maxima }}</td>
                <td class="text-center">{{ $estadistica['grupo']->grp_capacidad }}</td>
                <td class="text-center">{{ $estadistica['ninos_activos'] }}</td>
                <td class="text-center">{{ $estadistica['capacidad_disponible'] }}</td>
                <td class="text-center">{{ $estadistica['capacidad_utilizada'] }}%</td>
                <td>{{ $estadistica['grupo']->responsable->usuario->usr_nombre }} {{ $estadistica['grupo']->responsable->usuario->usr_apellido }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte generado el {{ $fecha_generacion }} | Sistema de Gestión de Guardería</p>
    </div>
</body>
</html>
