require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const pacientesRoutes = require("./routes/pacientesRoutes");
const citasRoutes = require("./routes/citasRoutes");
const historialRoutes = require("./routes/historialRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const medicosRoutes = require("./routes/medicosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const estadosRoutes = require("./routes/estadosRoutes");
// ...
// ...

// Importar middlewares
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://sistema-gestion-medica-puce.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/estados", estadosRoutes);

// Ruta de salud
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message:
      "Sistema de Gestión Médica - Centro de Salud San José, Aguascalientes",
    timestamp: new Date().toISOString(),
  });
});

// Middleware de manejo de errores
app.use(errorMiddleware);

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = app;
