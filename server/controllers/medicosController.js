const pool = require('../config/database');
const logger = require('../utils/logger');

exports.listarMedicos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.cedula_profesional, m.nombre, m.apellido_paterno, 
              m.apellido_materno, m.especialidad, m.email, m.telefono, m.activo
       FROM medicos m
       ORDER BY m.nombre, m.apellido_paterno`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error al listar médicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.crearMedico = async (req, res) => {
  const { cedula_profesional, nombre, apellido_paterno, apellido_materno, especialidad, email, telefono } = req.body;

  try {
    if (!cedula_profesional || !nombre || !apellido_paterno || !especialidad || !email) {
      return res.status(400).json({ error: 'Los campos obligatorios están incompletos' });
    }

    const existe = await pool.query(
      'SELECT id FROM medicos WHERE cedula_profesional = $1 OR email = $2',
      [cedula_profesional, email]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un médico con esa cédula o email' });
    }

    const result = await pool.query(
      `INSERT INTO medicos (cedula_profesional, nombre, apellido_paterno, apellido_materno, especialidad, email, telefono)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cedula_profesional, nombre, apellido_paterno, apellido_materno || null, especialidad, email, telefono || null]
    );

    logger.info(`Médico creado: ${nombre} ${apellido_paterno}`);
    res.status(201).json({ mensaje: 'Médico creado exitosamente', medico: result.rows[0] });
  } catch (error) {
    logger.error('Error al crear médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.eliminarMedico = async (req, res) => {
  const { id } = req.params;

  try {
    const tieneCitas = await pool.query(
      'SELECT id FROM citas WHERE medico_id = $1 AND estado IN ($2, $3)',
      [id, 'pendiente', 'en_atencion']
    );
    if (tieneCitas.rows.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: tiene citas pendientes o en atención' });
    }

    const result = await pool.query(
      'DELETE FROM medicos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Eliminar usuario asociado si existe
    await pool.query('DELETE FROM usuarios WHERE medico_id = $1', [id]);

    logger.info(`Médico eliminado: ID ${id}`);
    res.json({ mensaje: 'Médico eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};