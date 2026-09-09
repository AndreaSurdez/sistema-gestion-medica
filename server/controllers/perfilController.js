const bcrypt = require("bcrypt");
const pool = require("../config/database");
const logger = require("../utils/logger");

exports.obtenerPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.rol, u.medico_id, u.paciente_id,
              m.nombre as medico_nombre, 
              m.apellido_paterno as medico_apellido, 
              m.especialidad,
              m.email,
              m.telefono,
              p.nombre as paciente_nombre,
              p.apellido_paterno as paciente_apellido,
              p.curp,
              p.fecha_nacimiento,
              p.email as paciente_email,
              p.telefono as paciente_telefono
       FROM usuarios u
       LEFT JOIN medicos m ON u.medico_id = m.id
       LEFT JOIN pacientes p ON u.paciente_id = p.id
       WHERE u.id = $1`,
      [usuarioId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.actualizarPerfil = async (req, res) => {
  const { email, telefono } = req.body;
  const usuarioId = req.usuario.id;

  try {
    const usuarioResult = await pool.query(
      "SELECT medico_id, paciente_id, rol FROM usuarios WHERE id = $1",
      [usuarioId],
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { medico_id, paciente_id, rol } = usuarioResult.rows[0];

    if (rol === "paciente" && paciente_id) {
      // Actualizar en tabla pacientes
      await pool.query(
        `UPDATE pacientes 
         SET email = COALESCE($1, email),
             telefono = COALESCE($2, telefono)
         WHERE id = $3`,
        [email, telefono, paciente_id],
      );
    } else if (medico_id) {
      // Actualizar en tabla medicos
      await pool.query(
        `UPDATE medicos 
         SET email = COALESCE($1, email),
             telefono = COALESCE($2, telefono)
         WHERE id = $3`,
        [email, telefono, medico_id],
      );
    }

    logger.info(`Perfil actualizado: usuario ${usuarioId}`);
    res.json({ mensaje: "Perfil actualizado exitosamente" });
  } catch (error) {
    logger.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.cambiarPassword = async (req, res) => {
  const { passwordActual, passwordNuevo } = req.body;
  const usuarioId = req.usuario.id;

  try {
    if (!passwordActual || !passwordNuevo) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    if (passwordNuevo.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const result = await pool.query(
      "SELECT password_hash FROM usuarios WHERE id = $1",
      [usuarioId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordValido = await bcrypt.compare(
      passwordActual,
      result.rows[0].password_hash,
    );
    if (!passwordValido) {
      return res
        .status(401)
        .json({ error: "La contraseña actual es incorrecta" });
    }

    const passwordHash = await bcrypt.hash(passwordNuevo, 10);

    await pool.query("UPDATE usuarios SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      usuarioId,
    ]);

    logger.info(`Contraseña cambiada: usuario ${usuarioId}`);
    res.json({ mensaje: "Contraseña actualizada exitosamente" });
  } catch (error) {
    logger.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener citas del paciente actual
exports.obtenerCitasPaciente = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const usuarioResult = await pool.query(
      "SELECT paciente_id FROM usuarios WHERE id = $1",
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0 || !usuarioResult.rows[0].paciente_id) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const pacienteId = usuarioResult.rows[0].paciente_id;

    const result = await pool.query(
      `SELECT c.id, c.fecha, c.hora, c.estado, c.tipo_cita, c.motivo_consulta,
              m.nombre as medico_nombre, 
              m.apellido_paterno as medico_apellido,
              m.especialidad
       FROM citas c
       JOIN medicos m ON c.medico_id = m.id
       WHERE c.paciente_id = $1
       ORDER BY c.fecha DESC, c.hora DESC`,
      [pacienteId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Error al obtener citas del paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener historial clínico del paciente actual
exports.obtenerHistorialPaciente = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const usuarioResult = await pool.query(
      "SELECT paciente_id FROM usuarios WHERE id = $1",
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0 || !usuarioResult.rows[0].paciente_id) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const pacienteId = usuarioResult.rows[0].paciente_id;

    const result = await pool.query(
      `SELECT h.id, h.fecha_consulta, h.motivo_consulta, h.diagnostico, 
              h.diagnostico_cie10, h.tratamiento, h.medicamentos_recetados,
              h.dosis, h.frecuencia, h.recomendaciones,
              m.nombre as medico_nombre, 
              m.apellido_paterno as medico_apellido,
              m.especialidad
       FROM historial_clinico h
       JOIN medicos m ON h.medico_id = m.id
       WHERE h.paciente_id = $1
       ORDER BY h.fecha_consulta DESC`,
      [pacienteId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Error al obtener historial del paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};