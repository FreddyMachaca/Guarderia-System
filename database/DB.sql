CREATE DATABASE "guarderia_db";
\c guarderia_db;

CREATE TABLE public.tbl_usr_usuarios (
    usr_id SERIAL PRIMARY KEY NOT NULL,
    usr_nombre VARCHAR(100) NOT NULL,
    usr_apellido VARCHAR(100) NOT NULL,
    usr_email VARCHAR(150) UNIQUE NOT NULL,
    usr_password VARCHAR(255) NOT NULL,
    usr_telefono VARCHAR(20),
    usr_tipo VARCHAR(30) NOT NULL, -- 'admin', 'familiar', 'personal'
    usr_estado VARCHAR(20) NOT NULL, -- 'activo', 'inactivo'
    usr_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usr_fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de padres
CREATE TABLE public.tbl_pdr_padres (
    pdr_id SERIAL PRIMARY KEY NOT NULL,
    pdr_usr_id INT NOT NULL,
    pdr_direccion TEXT,
    pdr_ocupacion VARCHAR(100),
    pdr_contacto_emergencia VARCHAR(100),
    pdr_telefono_emergencia VARCHAR(20),
    pdr_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de personal
CREATE TABLE public.tbl_prs_personal (
    prs_id SERIAL PRIMARY KEY NOT NULL,
    prs_usr_id INT NOT NULL,
    prs_codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
    prs_cargo VARCHAR(100) NOT NULL,
    prs_fecha_ingreso DATE NOT NULL,
    prs_salario DECIMAL(10,2),
    prs_horario VARCHAR(100),
    prs_fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de niños
CREATE TABLE public.tbl_nin_ninos (
    nin_id SERIAL PRIMARY KEY NOT NULL,
    nin_nombre VARCHAR(100) NOT NULL,
    nin_apellido VARCHAR(100) NOT NULL,
    nin_fecha_nacimiento DATE NOT NULL,
    nin_genero VARCHAR(20) NOT NULL, -- 'masculino' o 'femenino'
    nin_alergias TEXT,
    nin_medicamentos TEXT,
    nin_observaciones TEXT,
    nin_fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nin_estado VARCHAR(20) DEFAULT 'activo' -- 'activo' o 'inactivo'
);

-- Tabla de relación padres-niños
CREATE TABLE public.tbl_rel_padres_ninos (
    rel_id SERIAL PRIMARY KEY NOT NULL,
    rel_pdr_id INT NOT NULL,
    rel_nin_id INT NOT NULL,
    rel_parentesco VARCHAR(20) NOT NULL, -- 'padre', 'madre', etc.
    rel_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);