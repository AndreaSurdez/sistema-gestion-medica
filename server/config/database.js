const { Pool } = require("pg");
const logger = require("../utils/logger");

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  // Forma con variables separadas
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "gestion_medica",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool.on("connect", () => {
  logger.info("Conexión exitosa a la base de datos");
});

pool.on("error", (err) => {
  logger.error("Error inesperado en el pool de conexiones:", err);
  process.exit(-1);
});

module.exports = pool;
