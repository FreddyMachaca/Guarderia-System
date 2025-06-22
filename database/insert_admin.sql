-- Script para crear usuario administrador inicial

-- Insertar usuario admin
INSERT INTO public.tbl_usr_usuarios (
    usr_nombre, 
    usr_apellido, 
    usr_email, 
    usr_password, 
    usr_telefono, 
    usr_tipo, 
    usr_estado
) VALUES (
    'Admin',
    'Sistema',
    'admin@guarderia.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+591 12345678',
    'admin',
    'activo'
);

-- Obtener el ID del usuario recién creado e insertar en tabla de personal
INSERT INTO public.tbl_prs_personal (
    prs_usr_id,
    prs_codigo_empleado,
    prs_cargo,
    prs_fecha_ingreso,
    prs_salario,
    prs_horario
) VALUES (
    (SELECT usr_id FROM public.tbl_usr_usuarios WHERE usr_email = 'admin@guarderia.com'),
    'ADM001',
    'Administrador General',
    CURRENT_DATE,
    5000.00,
    'Lunes a Viernes 8:00-17:00'
);

-- Usuario de prueba para padres
INSERT INTO public.tbl_usr_usuarios (
    usr_nombre, 
    usr_apellido, 
    usr_email, 
    usr_password, 
    usr_telefono, 
    usr_tipo, 
    usr_estado
) VALUES (
    'Juan',
    'Pérez',
    'padre@guarderia.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+591 87654321',
    'familiar',
    'activo'
);

-- Insertar padre en tabla de padres
INSERT INTO public.tbl_pdr_padres (
    pdr_usr_id,
    pdr_direccion,
    pdr_ocupacion,
    pdr_contacto_emergencia,
    pdr_telefono_emergencia
) VALUES (
    (SELECT usr_id FROM public.tbl_usr_usuarios WHERE usr_email = 'padre@guarderia.com'),
    'Av. Ejemplo 123, Zona Central',
    'Ingeniero',
    'María Pérez',
    '+591 87654322'
);

-- Usuario de prueba para personal
INSERT INTO public.tbl_usr_usuarios (
    usr_nombre, 
    usr_apellido, 
    usr_email, 
    usr_password, 
    usr_telefono,
    usr_tipo,
    usr_estado
) VALUES (
    'Ana',
    'Gómez',
    'personal@gmail.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+591 98765432',
    'personal',
    'activo'
);

-- Insertar personal en tabla de personal
INSERT INTO public.tbl_prs_personal (
    prs_usr_id,
    prs_codigo_empleado,
    prs_cargo,
    prs_fecha_ingreso,
    prs_salario,
    prs_horario
) VALUES (
    (SELECT usr_id FROM public.tbl_usr_usuarios WHERE usr_email = 'personal@gmail.com'),
    'PRS001',
    'Maestra de Jardín',
    CURRENT_DATE,
    3000.00,
    'Lunes a Viernes 8:00-17:00'
);