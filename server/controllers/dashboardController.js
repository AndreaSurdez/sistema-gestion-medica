const pool = require("../config/database");
const logger = require("../utils/logger");

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { fecha_inicio, fecha_fin } = req.query;

    const totalPacientesResult = await pool.query(
      "SELECT COUNT(*) FROM pacientes",
    );
    const totalPacientes = parseInt(totalPacientesResult.rows[0].count);

    // Estadísticas de citas por estado en el rango
    let citasQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
             COUNT(CASE WHEN estado = 'en_atencion' THEN 1 END) as en_atencion,
             COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as finalizadas,
             COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas
      FROM citas
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (fecha_inicio) {
      citasQuery += ` AND fecha >= $${paramIndex}`;
      params.push(fecha_inicio);
      paramIndex++;
    }
    if (fecha_fin) {
      citasQuery += ` AND fecha <= $${paramIndex}`;
      params.push(fecha_fin);
      paramIndex++;
    }
    if (usuario.rol === "medico") {
      citasQuery += ` AND medico_id = $${paramIndex}`;
      params.push(usuario.medico_id);
    }

    const citasResult = await pool.query(citasQuery, params);
    const citasStats = citasResult.rows[0];

    // NUEVA: Citas por especialidad en el rango
    let especialidadQuery = `
      SELECT m.especialidad, COUNT(*) as cantidad
      FROM citas c
      JOIN medicos m ON c.medico_id = m.id
      WHERE 1=1
    `;

    const espParams = [];
    let espIndex = 1;

    if (fecha_inicio) {
      especialidadQuery += ` AND c.fecha >= $${espIndex}`;
      espParams.push(fecha_inicio);
      espIndex++;
    }
    if (fecha_fin) {
      especialidadQuery += ` AND c.fecha <= $${espIndex}`;
      espParams.push(fecha_fin);
      espIndex++;
    }
    if (usuario.rol === "medico") {
      especialidadQuery += ` AND c.medico_id = $${espIndex}`;
      espParams.push(usuario.medico_id);
    }
    especialidadQuery += " GROUP BY m.especialidad ORDER BY cantidad DESC";

    const especialidadResult = await pool.query(especialidadQuery, espParams);

    res.json({
      totalPacientes,
      citasHoy: {
        total: parseInt(citasStats.total),
        pendientes: parseInt(citasStats.pendientes),
        enAtencion: parseInt(citasStats.en_atencion),
        finalizadas: parseInt(citasStats.finalizadas),
        canceladas: parseInt(citasStats.canceladas),
      },
      citasPorEspecialidad: especialidadResult.rows,
    });
  } catch (error) {
    logger.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.obtenerCitasDashboard = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { fecha_inicio, fecha_fin } = req.query;

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
    if (usuario.rol === "medico") {
      query += ` AND c.medico_id = $${paramIndex}`;
      params.push(usuario.medico_id);
    }

    query += " ORDER BY c.fecha ASC, c.hora ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error al obtener citas del dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
