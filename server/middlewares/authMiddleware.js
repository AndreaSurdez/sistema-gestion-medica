const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

// Verificar que el usuario esté autenticado
const verificar = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Verificar que sea administrador
const esAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "administrativo") {
    return res
      .status(403)
      .json({ error: "No tienes permisos de administrador" });
  }
  next();
};

// Verificar que sea médico
const esMedico = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "medico") {
    return res.status(403).json({ error: "No tienes permisos de médico" });
  }
  next();
};

// Verificar que sea paciente
const esPaciente = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "paciente") {
    return res.status(403).json({ error: "No tienes permisos de paciente" });
  }
  next();
};

module.exports = { verificar, esAdmin, esMedico, esPaciente };
