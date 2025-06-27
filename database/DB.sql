create table if not exists public.tbl_usr_usuarios
(
    usr_id                  serial
        primary key,
    usr_nombre              varchar(100) not null,
    usr_apellido            varchar(100) not null,
    usr_email               varchar(150) not null
        unique,
    usr_password            varchar(255) not null,
    usr_telefono            varchar(20),
    usr_tipo                varchar(30)  not null,
    usr_estado              varchar(20)  not null,
    usr_fecha_creacion      timestamp default CURRENT_TIMESTAMP,
    usr_fecha_actualizacion timestamp default CURRENT_TIMESTAMP
);

alter table public.tbl_usr_usuarios
    owner to postgres;

create table if not exists public.tbl_pdr_padres
(
    pdr_id                  serial
        primary key,
    pdr_usr_id              integer not null,
    pdr_direccion           text,
    pdr_ocupacion           varchar(100),
    pdr_contacto_emergencia varchar(100),
    pdr_fecha_registro      timestamp default CURRENT_TIMESTAMP,
    pdr_ci                  varchar(20),
    pdr_ci_ext              varchar(5),
    pdr_estado              varchar(20)
);

alter table public.tbl_pdr_padres
    owner to postgres;

create table if not exists public.tbl_prs_personal
(
    prs_id              serial
        primary key,
    prs_usr_id          integer      not null,
    prs_codigo_empleado varchar(20)  not null
        unique,
    prs_cargo           varchar(100) not null,
    prs_fecha_ingreso   date         not null,
    prs_salario         numeric(10, 2),
    prs_horario         varchar(100),
    prs_fecha_registro  timestamp default CURRENT_TIMESTAMP,
    prs_ci              varchar(20),
    prs_ci_expedido     varchar(5),
    prs_foto            varchar(255)
);

alter table public.tbl_prs_personal
    owner to postgres;

create table if not exists public.tbl_nin_ninos
(
    nin_id                serial
        primary key,
    nin_nombre            varchar(100) not null,
    nin_apellido          varchar(100) not null,
    nin_fecha_nacimiento  date         not null,
    nin_edad              integer      not null,
    nin_genero            varchar(20)  not null,
    nin_foto              varchar(255),
    nin_alergias          text,
    nin_medicamentos      text,
    nin_observaciones     text,
    nin_fecha_inscripcion timestamp default CURRENT_TIMESTAMP,
    nin_estado            varchar(20)
);

alter table public.tbl_nin_ninos
    owner to postgres;

create table if not exists public.tbl_rel_padres_ninos
(
    rel_id             serial
        primary key,
    rel_pdr_id         integer     not null,
    rel_nin_id         integer     not null,
    rel_parentesco     varchar(20) not null,
    rel_fecha_creacion timestamp default CURRENT_TIMESTAMP
);

alter table public.tbl_rel_padres_ninos
    owner to postgres;

create table if not exists public.tbl_tkn_tokens
(
    tkn_id               serial
        primary key,
    tkn_token            varchar(255) not null
        unique,
    tkn_usr_id           integer      not null,
    tkn_estado           varchar(20)  not null,
    tkn_fecha_creacion   timestamp default CURRENT_TIMESTAMP,
    tkn_fecha_expiracion timestamp    not null
);

alter table public.tbl_tkn_tokens
    owner to postgres;

create table if not exists public.tbl_grp_grupos
(
    grp_id                  serial
        primary key,
    grp_nombre              varchar(100) not null,
    grp_descripcion         text,
    grp_capacidad           integer      not null,
    grp_edad_minima         integer      not null,
    grp_edad_maxima         integer      not null,
    grp_responsable_id      integer      not null,
    grp_estado              varchar(20)  not null,
    grp_fecha_creacion      timestamp default CURRENT_TIMESTAMP,
    grp_fecha_actualizacion timestamp default CURRENT_TIMESTAMP
);

alter table public.tbl_grp_grupos
    owner to postgres;

create table if not exists public.tbl_asn_asignaciones_ninos
(
    asn_id               serial
        primary key,
    asn_nin_id           integer     not null,
    asn_grp_id           integer     not null,
    asn_fecha_asignacion timestamp default CURRENT_TIMESTAMP,
    asn_fecha_baja       timestamp,
    asn_estado           varchar(20) not null,
    asn_observaciones    text
);

alter table public.tbl_asn_asignaciones_ninos
    owner to postgres;