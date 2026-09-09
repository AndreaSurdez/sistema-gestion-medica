-- ============================================================================
-- SISTEMA DE GESTIÓN MÉDICA - CENTRO DE SALUD SAN JOSÉ
-- Ubicación: Aguascalientes, México
-- Script de creación de base de datos
-- Cumplimiento: NOM-004-SSA3-2012 y LFPDPPP
-- ============================================================================

-- Eliminar tablas si existen (en orden inverso de dependencias)
DROP TABLE IF EXISTS auditoria_accesos CASCADE;
DROP TABLE IF EXISTS historial_clinico CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;

-- ============================================================================
-- TABLA: PACIENTES
-- Descripción: Registro de pacientes con CURP (identificador único mexicano)
-- ============================================================================
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    curp VARCHAR(18) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE NOT NULL,
    sexo VARCHAR(10) CHECK (sexo IN ('Masculino', 'Femenino', 'Otro')),
    telefono VARCHAR(15),
    email VARCHAR(100),
    direccion TEXT,
    colonia VARCHAR(100),
    ciudad VARCHAR(100) DEFAULT 'Aguascalientes',
    estado VARCHAR(100) DEFAULT 'Aguascalientes',
    codigo_postal VARCHAR(10),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción: CURP debe tener 18 caracteres
    CONSTRAINT curp_longitud CHECK (LENGTH(curp) = 18)
);

-- Índices para optimización de búsquedas
CREATE INDEX idx_pacientes_curp ON pacientes(curp);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre, apellido_paterno);
CREATE INDEX idx_pacientes_fecha_nacimiento ON pacientes(fecha_nacimiento);

-- ============================================================================
-- TABLA: MÉDICOS
-- Descripción: Registro del personal médico del centro de salud
-- ============================================================================
CREATE TABLE medicos (
    id SERIAL PRIMARY KEY,
    cedula_profesional VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    especialidad VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    fecha_contratacion DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validación de cédula profesional (mínimo 6 caracteres)
    CONSTRAINT cedula_longitud CHECK (LENGTH(cedula_profesional) >= 6)
);

-- Índices
CREATE INDEX idx_medicos_cedula ON medicos(cedula_profesional);
CREATE INDEX idx_medicos_especialidad ON medicos(especialidad);
CREATE INDEX idx_medicos_activo ON medicos(activo);

-- ============================================================================
-- TABLA: USUARIOS DEL SISTEMA
-- Descripción: Credenciales de acceso al sistema (administrativos y médicos)
-- ============================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('administrativo', 'medico', 'super_admin')),
    medico_id INTEGER REFERENCES medicos(id) ON DELETE SET NULL,
    ultimo_acceso TIMESTAMP,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validación de rol
    CONSTRAINT rol_valido CHECK (rol IN ('administrativo', 'medico', 'super_admin'))
);

-- Índices
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_medico_id ON usuarios(medico_id);

-- ============================================================================
-- TABLA: CITAS / TURNOS
-- Descripción: Registro de citas médicas programadas
-- ============================================================================
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id INTEGER NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    tipo_cita VARCHAR(50) DEFAULT 'Consulta General',
    motivo_consulta TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'en_atencion', 'finalizada', 'cancelada', 'no_asistio')),
    notas_adicionales TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id),
    
    -- Restricción: No permitir citas en el pasado
    CONSTRAINT fecha_futura CHECK (fecha >= CURRENT_DATE),
    
    -- Restricción única: Un médico no puede tener dos citas a la misma hora
    CONSTRAINT unico_horario_medico UNIQUE (medico_id, fecha, hora)
);

-- Índices para optimización
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_medico ON citas(medico_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_citas_fecha_hora ON citas(fecha, hora);
CREATE INDEX idx_citas_medico_fecha ON citas(medico_id, fecha);

-- ============================================================================
-- TABLA: HISTORIAL CLÍNICO
-- Descripción: Registro de consultas y evoluciones del paciente
-- Cumplimiento: NOM-004-SSA3-2012 (Expediente Clínico)
-- ============================================================================
CREATE TABLE historial_clinico (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    cita_id INTEGER REFERENCES citas(id) ON DELETE SET NULL,
    medico_id INTEGER NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo_consulta TEXT NOT NULL,
    antecedentes_hereditarios TEXT,
    antecedentes_personales TEXT,
    exploracion_fisica TEXT,
    diagnostico TEXT NOT NULL,
    diagnostico_cie10 VARCHAR(10), -- Código CIE-10 del diagnóstico
    tratamiento TEXT,
    medicamentos_recetados TEXT,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion_tratamiento VARCHAR(50),
    recomendaciones TEXT,
    estudio_solicitados TEXT,
    fecha_proxima_cita DATE,
    tipo_consulta VARCHAR(50) DEFAULT 'General',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validación: El diagnóstico no puede estar vacío
    CONSTRAINT diagnostico_no_vacio CHECK (LENGTH(diagnostico) > 0)
);

-- Índices
CREATE INDEX idx_historial_paciente ON historial_clinico(paciente_id);
CREATE INDEX idx_historial_medico ON historial_clinico(medico_id);
CREATE INDEX idx_historial_fecha ON historial_clinico(fecha_consulta);
CREATE INDEX idx_historial_cita ON historial_clinico(cita_id);

-- ============================================================================
-- TABLA: AUDITORÍA DE ACCESOS
-- Descripción: Registro de accesos al sistema (Cumplimiento LFPDPPP)
-- ============================================================================
CREATE TABLE auditoria_accesos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    ip_origen VARCHAR(45),
    user_agent TEXT,
    detalles JSONB,
    fecha_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para auditoría
CREATE INDEX idx_auditoria_usuario ON auditoria_accesos(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_accesos(fecha_acceso);
CREATE INDEX idx_auditoria_accion ON auditoria_accesos(accion);
CREATE INDEX idx_auditoria_tabla ON auditoria_accesos(tabla_afectada);

-- ============================================================================
-- TABLA: CONFIGURACIÓN DEL SISTEMA
-- Descripción: Parámetros configurables del sistema
-- ============================================================================
CREATE TABLE configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo_dato VARCHAR(20) DEFAULT 'texto',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INSERTAR DATOS INICIALES DE CONFIGURACIÓN
-- ============================================================================
INSERT INTO configuracion_sistema (clave, valor, descripcion, tipo_dato) VALUES
('nombre_centro', 'Centro de Salud Comunitario San José', 'Nombre del centro de salud', 'texto'),
('direccion_centro', 'Aguascalientes, Ags.', 'Dirección del centro', 'texto'),
('telefono_centro', '(449) XXX-XXXX', 'Teléfono de contacto', 'texto'),
('horario_atencion', 'Lunes a Viernes 8:00 - 16:00', 'Horario de atención', 'texto'),
('duracion_cita_default', '30', 'Duración predeterminada de cita en minutos', 'numero'),
('max_intentos_login', '5', 'Número máximo de intentos de login', 'numero'),
('tiempo_bloqueo', '30', 'Tiempo de bloqueo en minutos', 'numero');

-- ============================================================================
-- CREAR FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función: Actualizar automáticamente fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para pacientes
CREATE TRIGGER trg_actualizar_pacientes
    BEFORE UPDATE ON pacientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Trigger para usuarios
CREATE TRIGGER trg_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Trigger para citas
CREATE TRIGGER trg_actualizar_citas
    BEFORE UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Trigger para historial clínico
CREATE TRIGGER trg_actualizar_historial
    BEFORE UPDATE ON historial_clinico
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- ============================================================================
-- PERMISOS Y ROLES (PostgreSQL)
-- ============================================================================

-- Crear rol para la aplicación (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_aplicacion_salud') THEN
        CREATE ROLE rol_aplicacion_salud WITH LOGIN PASSWORD 'password_seguro_cambiar';
    END IF;
END
$$;

-- Otorgar permisos al rol de aplicación
GRANT CONNECT ON DATABASE gestion_medica TO rol_aplicacion_salud;
GRANT USAGE ON SCHEMA public TO rol_aplicacion_salud;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_aplicacion_salud;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_aplicacion_salud;

-- ============================================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================================================
COMMENT ON TABLE pacientes IS 'Registro de pacientes del centro de salud con CURP como identificador único';
COMMENT ON TABLE medicos IS 'Personal médico del centro de salud con cédula profesional';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema con roles de acceso (administrativo, médico, super_admin)';
COMMENT ON TABLE citas IS 'Programación de citas médicas con validación de horarios';
COMMENT ON TABLE historial_clinico IS 'Expediente clínico electrónico cumpliendo NOM-004-SSA3-2012';
COMMENT ON TABLE auditoria_accesos IS 'Registro de auditoría para cumplimiento de LFPDPPP';
COMMENT ON TABLE configuracion_sistema IS 'Parámetros configurables del sistema';

-- ============================================================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'BASE DE DATOS CREADA EXITOSAMENTE';
    RAISE NOTICE 'Sistema: Centro de Salud Comunitario San José';
    RAISE NOTICE 'Ubicación: Aguascalientes, México';
    RAISE NOTICE 'Tablas creadas: 6 tablas principales + configuración';
    RAISE NOTICE 'Índices creados: 25 índices para optimización';
    RAISE NOTICE 'Triggers: 4 triggers de actualización automática';
    RAISE NOTICE 'Cumplimiento: NOM-004-SSA3-2012 y LFPDPPP';
    RAISE NOTICE '================================================================';
END $$;