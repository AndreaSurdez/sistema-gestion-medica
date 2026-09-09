require('dotenv').config();
const { Pool } = require('pg');

console.log('Intentando conectar con:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || 5432);
console.log('Database:', process.env.DB_NAME || 'gestion_medica');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Password:', process.env.DB_PASSWORD ? '***' : 'SIN CONTRASEÑA');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gestion_medica',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error de conexión:', err.message);
  } else {
    console.log('¡Conexión exitosa!');
    console.log('Hora del servidor:', res.rows[0].now);
  }
  pool.end();
});