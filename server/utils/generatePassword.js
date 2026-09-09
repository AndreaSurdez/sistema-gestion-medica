// server/utils/generatePassword.js
// Script para generar hash de contraseñas usando bcrypt
// Uso: node utils/generatePassword.js [contraseña] [saltRounds]
// Ejemplo: node utils/generatePassword.js admin123 10

const bcrypt = require('bcrypt');

// Contraseña por defecto si no se proporciona argumento
const password = process.argv[2] || 'admin123';
const saltRounds = parseInt(process.argv[3]) || 10;

console.log('===========================================');
console.log('  GENERADOR DE HASH DE CONTRASEÑAS (bcrypt)');
console.log('===========================================');
console.log('');
console.log(`Contraseña a hashear: ${password}`);
console.log(`Salt rounds: ${saltRounds}`);
console.log('');

// Generar el hash
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error al generar el hash:', err);
    process.exit(1);
  }

  console.log('Hash generado exitosamente:');
  console.log('');
  console.log('-------------------------------------------');
  console.log(hash);
  console.log('-------------------------------------------');
  console.log('');
  console.log('INSTRUCCIONES:');
  console.log('');
  console.log('1. Copia el hash generado arriba');
  console.log('2. Abre el archivo: database/seeds/001_seed_data.sql');
  console.log('3. Reemplaza "$2b$10$YourHashedPasswordHere" por el hash copiado');
  console.log('4. Ejecuta el script SQL nuevamente en PostgreSQL');
  console.log('');
  console.log('Tip: Puedes generar hashes para diferentes contraseñas ejecutando:');
  console.log('   node utils/generatePassword.js miContraseña123');
  console.log('');
  console.log('===========================================');
});