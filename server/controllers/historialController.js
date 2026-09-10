const pool = require("../config/database");
const logger = require("../utils/logger");

exports.registrarEntrada = async (req, res) => {
  const {
    paciente_id,
    cita_id,
    motivo_consulta,
    diagnostico,
    tratamiento,
    observaciones,
    fecha_control,
  } = req.body;
  const medico_registro = req.usuario.medico_id;

  try {
    if (!paciente_id || !motivo_consulta || !diagnostico) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (!medico_registro) {
      return res
        .status(403)
        .json({ error: "Solo los médicos pueden registrar historial clínico" });
    }

    const pacienteExiste = await pool.query(
      "SELECT id FROM pacientes WHERE id = $1",
      [paciente_id],
    );
    if (pacienteExiste.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const result = await pool.query(
      `INSERT INTO historial_clinico 
       (paciente_id, cita_id, motivo_consulta, diagnostico, tratamiento, observaciones, medico_registro, fecha_control)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        paciente_id,
        cita_id,
        motivo_consulta,
        diagnostico,
        tratamiento,
        observaciones,
        medico_registro,
        fecha_control || null,
      ],
    );

    if (cita_id) {
      await pool.query("UPDATE citas SET estado = 'finalizada' WHERE id = $1", [
        cita_id,
      ]);
    }

    await pool.query(
      `INSERT INTO auditoria_accesos (usuario_id, accion, tabla_afectada, registro_id)
       VALUES ($1, 'REGISTRAR_HISTORIAL', 'historial_clinico', $2)`,
      [req.usuario.id, result.rows[0].id],
    );

    logger.info(
      `Historial registrado: Paciente ${paciente_id} por médico ${medico_registro}`,
    );

    res.status(201).json({
      mensaje: "Entrada de historial registrada exitosamente",
      historial: result.rows[0],
    });
  } catch (error) {
    logger.error("Error al registrar historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.consultarHistorial = async (req, res) => {
  const { paciente_id } = req.params;

  try {
    await pool.query(
      `INSERT INTO auditoria_accesos (usuario_id, accion, tabla_afectada, registro_id)
       VALUES ($1, 'CONSULTAR_HISTORIAL', 'historial_clinico', $2)`,
      [req.usuario.id, paciente_id],
    );

    // El SELECT * ya traerá la nueva columna fecha_control automáticamente
    const result = await pool.query(
      `SELECT h.*, m.nombre || ' ' || m.apellido as medico_nombre
       FROM historial_clinico h
       JOIN medicos m ON h.medico_registro = m.id
       WHERE h.paciente_id = $1
       ORDER BY h.fecha_registro DESC`,
      [paciente_id],
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Error al consultar historial:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
