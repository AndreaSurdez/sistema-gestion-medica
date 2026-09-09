const pool = require("../config/database");
const logger = require("../utils/logger");

exports.registrar = async (req, res) => {
  const {
    curp,
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    sexo,
    telefono,
    email,
    direccion,
    colonia,
    ciudad,
    estado,
    codigo_postal,
  } = req.body;

  try {
    // Validación de campos obligatorios corregida
    if (!curp || !nombre || !apellido_paterno || !fecha_nacimiento) {
      return res
        .status(400)
        .json({
          error:
            "Faltan campos obligatorios (CURP, Nombre, Apellido Paterno, Fecha de Nacimiento)",
        });
    }

    const curpLimpio = curp.toUpperCase().replace(/\s/g, "");
    if (curpLimpio.length !== 18) {
      return res
        .status(400)
        .json({ error: "Formato de CURP inválido (debe tener 18 caracteres)" });
    }

    const fechaNac = new Date(fecha_nacimiento);
    if (fechaNac > new Date()) {
      return res
        .status(400)
        .json({ error: "La fecha de nacimiento no puede ser futura" });
    }

    const curpExiste = await pool.query(
      "SELECT id FROM pacientes WHERE curp = $1",
      [curpLimpio],
    );
    if (curpExiste.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "El CURP ya está registrado en el sistema" });
    }

    const result = await pool.query(
      `INSERT INTO pacientes (curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, email, direccion, colonia, ciudad, estado, codigo_postal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, email, direccion, colonia, ciudad, estado, codigo_postal, fecha_registro`,
      [
        curpLimpio,
        nombre,
        apellido_paterno,
        apellido_materno || null,
        fecha_nacimiento,
        sexo || null,
        telefono || null,
        email || null,
        direccion || null,
        colonia || null,
        ciudad || null,
        estado || null,
        codigo_postal || null,
      ],
    );

    logger.info(`Paciente registrado: CURP ${curpLimpio}`);
    res
      .status(201)
      .json({
        mensaje: "Paciente registrado exitosamente",
        paciente: result.rows[0],
      });
  } catch (error) {
    logger.error("Error al registrar paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, email, direccion, colonia, ciudad, estado, codigo_postal, fecha_registro 
      FROM pacientes 
      ORDER BY fecha_registro DESC
    `);
    res.json(result.rows);
  } catch (error) {
    logger.error("Error al listar pacientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.buscar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT id, curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, email, direccion, colonia, ciudad, estado, codigo_postal, fecha_registro 
      FROM pacientes 
      WHERE id = $1 OR curp = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Error al buscar paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    email,
    direccion,
    colonia,
    ciudad,
    estado,
    codigo_postal,
    sexo,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pacientes 
       SET nombre = COALESCE($1, nombre), 
           apellido_paterno = COALESCE($2, apellido_paterno),
           apellido_materno = COALESCE($3, apellido_materno),
           telefono = COALESCE($4, telefono), 
           email = COALESCE($5, email), 
           direccion = COALESCE($6, direccion),
           colonia = COALESCE($7, colonia),
           ciudad = COALESCE($8, ciudad),
           estado = COALESCE($9, estado),
           codigo_postal = COALESCE($10, codigo_postal),
           sexo = COALESCE($11, sexo)
       WHERE id = $12 
       RETURNING id, curp, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, telefono, email, direccion, colonia, ciudad, estado, codigo_postal`,
      [
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        email,
        direccion,
        colonia,
        ciudad,
        estado,
        codigo_postal,
        sexo,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    logger.info(`Paciente actualizado: ID ${id}`);
    res.json({
      mensaje: "Paciente actualizado exitosamente",
      paciente: result.rows[0],
    });
  } catch (error) {
    logger.error("Error al actualizar paciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    // Nota: En un sistema real, quizás quieras hacer un "borrado lógico" (cambiar estado a inactivo) en lugar de borrar físicamente
    const result = await pool.query(
      "DELETE FROM pacientes WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    logger.info(`Paciente eliminado: ID ${id}`);
    res.json({ mensaje: "Paciente eliminado exitosamente" });
  } catch (error) {
    logger.error("Error al eliminar paciente:", error);
    res
      .status(500)
      .json({
        error:
          "Error interno del servidor. Puede que tenga citas o historial asociado.",
      });
  }
};
