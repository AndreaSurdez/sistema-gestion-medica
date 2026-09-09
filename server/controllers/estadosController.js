const pool = require("../config/database");
const logger = require("../utils/logger");

exports.actualizarEstadosAutomaticos = async (req, res) => {
  try {
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split("T")[0];
    const horaActual = ahora.toTimeString().slice(0, 5); // "HH:MM"
    const horaActualCompleta = ahora.toTimeString().slice(0, 8); // "HH:MM:SS"

    // 1. Pendientes cuya hora ya pasó → En Atención
    // Comparamos la hora de la cita con la hora actual
    const enAtencionResult = await pool.query(
      `UPDATE citas SET estado = 'en_atencion' 
       WHERE estado = 'pendiente' 
         AND fecha = $1 
         AND hora <= $2
       RETURNING id, hora`,
      [fechaHoy, horaActual],
    );

    // 2. En atención con más de 3 horas desde su hora → Finalizada
    // Calculamos la hora límite: hora actual - 3 horas
    const hace3Horas = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
    const horaLimite = hace3Horas.toTimeString().slice(0, 5); // "HH:MM"

    const finalizadasResult = await pool.query(
      `UPDATE citas SET estado = 'finalizada'
       WHERE estado = 'en_atencion' 
         AND fecha = $1 
         AND hora <= $2
       RETURNING id, hora`,
      [fechaHoy, horaLimite],
    );

    logger.info(
      `Estados actualizados: ${enAtencionResult.rows.length} → en_atencion, ${finalizadasResult.rows.length} → finalizada`,
    );

    res.json({
      mensaje: "Estados actualizados",
      enAtencion: enAtencionResult.rows.length,
      finalizadas: finalizadasResult.rows.length,
      detalles: {
        enAtencion: enAtencionResult.rows,
        finalizadas: finalizadasResult.rows,
      },
    });
  } catch (error) {
    logger.error("Error al actualizar estados:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
