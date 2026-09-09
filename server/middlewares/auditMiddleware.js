const pool = require('../config/database');
const logger = require('../utils/logger');

exports.registrarAccion = (accion, tabla) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = async function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await pool.query(
            `INSERT INTO auditoria_accesos (usuario_id, accion, tabla_afectada, registro_id, ip_origen)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              req.usuario?.id,
              accion,
              tabla,
              data?.id || data?.cita?.id || data?.paciente?.id || null,
              req.ip
            ]
          );
        } catch (error) {
          logger.error('Error al registrar auditoría:', error);
        }
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};