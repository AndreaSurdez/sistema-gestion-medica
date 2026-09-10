const pool = require("../config/database");
const logger = require("../utils/logger");

// Crear cita
exports.crearCita = async (req, res) => {
  const { paciente_id, medico_id, fecha, hora, motivo_consulta, tipo_cita } =
    req.body;
  const usuario = req.usuario;

  try {
    if (!paciente_id || !medico_id || !fecha || !hora) {
      return res
        .status(400)
        .json({ error: "Todos los campos obligatorios deben estar completos" });
    }

    if (usuario.rol === "medico") {
      if (usuario.medico_id !== parseInt(medico_id)) {
        return res
          .status(403)
          .json({ error: "Solo puedes agendar citas contigo mismo" });
      }
    }

    const medicoResult = await pool.query(
      "SELECT especialidad FROM medicos WHERE id = $1",
      [medico_id],
    );
    if (medicoResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El médico seleccionado no existe" });
    }

    const pacienteExiste = await pool.query(
      "SELECT id FROM pacientes WHERE id = $1",
      [paciente_id],
    );
    if (pacienteExiste.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "El paciente seleccionado no existe" });
    }

    const conflicto = await pool.query(
      `SELECT id FROM citas WHERE medico_id = $1 AND fecha = $2 AND hora = $3 AND estado != 'cancelada'`,
      [medico_id, fecha, hora],
    );
    if (conflicto.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "El médico ya tiene una cita en ese horario" });
    }

    const result = await pool.query(
      `INSERT INTO citas (paciente_id, medico_id, fecha, hora, tipo_cita, motivo_consulta, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente') RETURNING *`,
      [
        paciente_id,
        medico_id,
        fecha,
        hora,
        tipo_cita || "Consulta General",
        motivo_consulta || null,
      ],
    );

    logger.info(
      `Cita creada: ID ${result.rows[0].id} por usuario ${usuario.username}`,
    );
    res
      .status(201)
      .json({ mensaje: "Cita creada exitosamente", cita: result.rows[0] });
  } catch (error) {
    logger.error("Error al crear cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Listar agenda (con restricciones por rol y filtros)
exports.listarAgenda = async (req, res) => {
  const {
    medico_id,
    fecha,
    fecha_inicio,
    fecha_fin,
    paciente_id,
    especialidad,
  } = req.query;
  const usuario = req.usuario;

  try {
    let query = `
      SELECT c.id, c.fecha, c.hora, c.estado, c.tipo_cita, c.motivo_consulta,
             p.nombre || ' ' || p.apellido_paterno as paciente_nombre,
             m.nombre || ' ' || m.apellido_paterno as medico_nombre,
             m.especialidad as especialidad_medico
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN medicos m ON c.medico_id = m.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (usuario.rol === "medico") {
      query += ` AND c.medico_id = $${paramIndex}`;
      params.push(usuario.medico_id);
      paramIndex++;
    } else if (medico_id) {
      query += ` AND c.medico_id = $${paramIndex}`;
      params.push(medico_id);
      paramIndex++;
    }

    if (paciente_id) {
      query += ` AND c.paciente_id = $${paramIndex}`;
      params.push(paciente_id);
      paramIndex++;
    }

    if (especialidad) {
      query += ` AND m.especialidad = $${paramIndex}`;
      params.push(especialidad);
      paramIndex++;
    }

    if (fecha) {
      query += ` AND c.fecha = $${paramIndex}`;
      params.push(fecha);
      paramIndex++;
    }

    if (fecha_inicio) {
      query += ` AND c.fecha >= $${paramIndex}`;
      params.push(fecha_inicio);
      paramIndex++;
    }

    if (fecha_fin) {
      query += ` AND c.fecha <= $${paramIndex}`;
      params.push(fecha_fin);
      paramIndex++;
    }

    query += " ORDER BY c.fecha DESC, c.hora DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error al listar agenda:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Cancelar cita
exports.cancelarCita = async (req, res) => {
  const { id } = req.params;
  const usuario = req.usuario;

  try {
    const cita = await pool.query("SELECT * FROM citas WHERE id = $1", [id]);
    if (cita.rows.length === 0)
      return res.status(404).json({ error: "Cita no encontrada" });

    if (
      usuario.rol === "medico" &&
      cita.rows[0].medico_id !== usuario.medico_id
    ) {
      return res
        .status(403)
        .json({ error: "No puedes cancelar citas de otros médicos" });
    }

    const result = await pool.query(
      `UPDATE citas SET estado = 'cancelada' WHERE id = $1 RETURNING *`,
      [id],
    );
    logger.info(`Cita cancelada: ID ${id} por usuario ${usuario.username}`);
    res.json({ mensaje: "Cita cancelada exitosamente", cita: result.rows[0] });
  } catch (error) {
    logger.error("Error al cancelar cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar estado de cita
exports.actualizarEstadoCita = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const usuario = req.usuario;

  try {
    const estadosValidos = [
      "pendiente",
      "en_atencion",
      "finalizada",
      "cancelada",
    ];
    if (!estadosValidos.includes(estado))
      return res.status(400).json({ error: "Estado no válido" });

    const cita = await pool.query("SELECT * FROM citas WHERE id = $1", [id]);
    if (cita.rows.length === 0)
      return res.status(404).json({ error: "Cita no encontrada" });

    if (
      usuario.rol === "medico" &&
      cita.rows[0].medico_id !== usuario.medico_id
    ) {
      return res
        .status(403)
        .json({ error: "No puedes actualizar citas de otros médicos" });
    }

    const result = await pool.query(
      `UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id],
    );
    logger.info(
      `Cita ${id} actualizada a estado '${estado}' por usuario ${usuario.username}`,
    );
    res.json({
      mensaje: "Estado actualizado exitosamente",
      cita: result.rows[0],
    });
  } catch (error) {
    logger.error("Error al actualizar estado de cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Editar cita
exports.editarCita = async (req, res) => {
  const { id } = req.params;
  const { fecha, hora, tipo_cita, motivo_consulta } = req.body;
  const usuario = req.usuario;

  try {
    const cita = await pool.query("SELECT * FROM citas WHERE id = $1", [id]);
    if (cita.rows.length === 0)
      return res.status(404).json({ error: "Cita no encontrada" });

    if (
      usuario.rol === "medico" &&
      cita.rows[0].medico_id !== usuario.medico_id
    ) {
      return res
        .status(403)
        .json({ error: "No puedes editar citas de otros médicos" });
    }

    const result = await pool.query(
      `UPDATE citas SET fecha = COALESCE($1, fecha), hora = COALESCE($2, hora), tipo_cita = COALESCE($3, tipo_cita), motivo_consulta = COALESCE($4, motivo_consulta) WHERE id = $5 RETURNING *`,
      [fecha, hora, tipo_cita, motivo_consulta, id],
    );

    logger.info(`Cita editada: ID ${id} por ${usuario.username}`);
    res.json({
      mensaje: "Cita actualizada exitosamente",
      cita: result.rows[0],
    });
  } catch (error) {
    logger.error("Error al editar cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
