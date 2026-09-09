const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const jwtConfig = require("../config/jwt");
const logger = require("../utils/logger");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    const passwordValido = await bcrypt.compare(
      password,
      usuario.password_hash,
    );
    if (!passwordValido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        medico_id: usuario.medico_id,
        paciente_id: usuario.paciente_id,
      },
      jwtConfig.secret,
      jwtConfig.options,
    );

    logger.info(`Login exitoso: usuario ${username} con rol ${usuario.rol}`);

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        medico_id: usuario.medico_id,
        paciente_id: usuario.paciente_id,
      },
    });
  } catch (error) {
    logger.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.registrar = async (req, res) => {
  const { username, password, rol, medico_id } = req.body;

  try {
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE username = $1",
      [username],
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El nombre de usuario ya existe" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (username, password_hash, rol, medico_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, rol`,
      [username, password_hash, rol, medico_id || null],
    );

    logger.info(`Usuario registrado: ${username} con rol ${rol}`);

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    logger.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
