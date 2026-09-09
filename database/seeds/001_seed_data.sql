-- PASO 1: Eliminar la restricción de fecha futura por si acaso (para evitar errores)
ALTER TABLE citas DROP CONSTRAINT IF EXISTS fecha_futura;

-- PASO 2: BORRAR TODOS LOS DATOS Y REINICIAR LOS IDs A 1 AUTOMÁTICAMENTE
TRUNCATE TABLE auditoria_accesos, historial_clinico, citas, usuarios, pacientes, medicos 
RESTART IDENTITY CASCADE;

-- PASO 3: INSERTAR MÉDICOS (Ahora tendrán ID 1, 2, 3)
INSERT INTO medicos (cedula_profesional, nombre, apellido_paterno, apellido_materno, especialidad, email, telefono) VALUES
('1234567', 'Juan', 'Pérez', 'García', 'Medicina General', 'juan.perez@sanjose-ags.mx', '4491234567'),
('7654321', 'María', 'González', 'López', 'Pediatría', 'maria.gonzalez@sanjose-ags.mx', '4497654321'),
('9876543', 'Carlos', 'Rodríguez', 'Martínez', 'Odontología', 'carlos.rodriguez@sanjose-ags.mx', '4499876543');

-- PASO 4: INSERTAR USUARIOS (Apuntando a los IDs 1 y 2 de los médicos)
-- Contraseña para todos: admin123
INSERT INTO usuarios (username, password_hash, rol, medico_id) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'administrativo', NULL),
('jperez', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'medico', 1),
('mgonzalez', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'medico', 2);

-- PASO 5: INSERTAR PACIENTES (Ahora tendrán ID 1, 2, 3, 4)
INSERT INTO pacientes (curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, email, direccion, colonia, ciudad, estado, codigo_postal) VALUES
('MEGA850315MAGRNNA9', 'Ana', 'Martínez', 'García', '1985-03-15', 'Femenino', '4491112233', 'ana.martinez@email.com', 'Av. Universidad 123', 'Centro', 'Aguascalientes', 'Aguascalientes', '20000'),
('SALP900722HAGNDR08', 'Pedro', 'Sánchez', 'López', '1990-07-22', 'Masculino', '4494445566', 'pedro.sanchez@email.com', 'Calle Jardines 45', 'Jardines', 'Aguascalientes', 'Aguascalientes', '20100'),
('TORL781108MAGRRR07', 'Laura', 'Torres', 'Ramírez', '1978-11-08', 'Femenino', '4497778899', 'laura.torres@email.com', 'Blvd. Díaz Ordaz 890', 'Girasoles', 'Aguascalientes', 'Aguascalientes', '20200'),
('HEDL051210HAGRZS05', 'Luis', 'Hernández', 'Díaz', '2005-12-10', 'Masculino', '4490001122', 'luis.hdz@email.com', 'Calle Robles 12', 'El Encino', 'Aguascalientes', 'Aguascalientes', '20300');

-- PASO 6: INSERTAR CITAS (Usando los IDs 1, 2, 3, 4 de pacientes y médicos)
-- Nota: Usamos CURRENT_DATE para evitar cualquier error de fechas pasadas
INSERT INTO citas (paciente_id, medico_id, fecha, hora, duracion_minutos, tipo_cita, motivo_consulta, estado) VALUES
(1, 1, CURRENT_DATE, '09:00:00', 30, 'Consulta General', 'Dolor de cabeza persistente', 'pendiente'),
(2, 2, CURRENT_DATE, '10:30:00', 30, 'Consulta General', 'Fiebre y tos en niño', 'finalizada'),
(3, 3, CURRENT_DATE + INTERVAL '1 day', '11:00:00', 45, 'Limpieza', 'Limpieza dental semestral', 'pendiente'),
(4, 2, CURRENT_DATE, '12:00:00', 30, 'Control Niño Sano', 'Vacunación y pesaje', 'pendiente');

-- PASO 7: INSERTAR HISTORIAL CLÍNICO
INSERT INTO historial_clinico (
    paciente_id, cita_id, medico_id, fecha_consulta, motivo_consulta, 
    antecedentes_hereditarios, antecedentes_personales, exploracion_fisica, 
    diagnostico, diagnostico_cie10, tratamiento, medicamentos_recetados, 
    dosis, frecuencia, duracion_tratamiento, recomendaciones, tipo_consulta
) VALUES (
    2, 2, 2, CURRENT_DATE,
    'Paciente de 33 años acude por cuadro de 2 días de evolución con fiebre de 38.5°C, tos seca y malestar general.',
    'Padre con hipertensión arterial.', 'No alergias conocidas. No tabaquismo.',
    'Paciente alerta, orientado. Faringe eritematosa. Auscultación pulmonar con murmullo vesicular conservado, sin agregados. Temp: 38.2°C.',
    'Infección de vías respiratorias altas, probable etiología viral.', 'J06.9',
    'Reposo relativo en casa, hidratación abundante y manejo sintomático.',
    'Paracetamol 500mg', '1 tableta', 'Cada 8 horas', '3 días',
    'Acudir a urgencias si la fiebre persiste por más de 3 días o hay dificultad para respirar.', 'General'
);