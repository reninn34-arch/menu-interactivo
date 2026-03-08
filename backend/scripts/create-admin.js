const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv').config();

async function createAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'menu_interactivo'
  });

  try {
    console.log('📦 Conectando a base de datos...');
    await client.connect();

    // Verificar si ya existe el usuario admin
    const checkUser = await client.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );

    if (checkUser.rows.length > 0) {
      console.log('⚠️  Usuario admin ya existe');
      console.log('   Si quieres cambiar la contraseña, elimínalo primero:');
      console.log('   DELETE FROM users WHERE username = \'admin\';');
      await client.end();
      return;
    }

    // Hash de la contraseña
    const password = 'admin1234';
    console.log('🔐 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario admin
    console.log('👤 Creando usuario admin...');
    await client.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      ['admin', hashedPassword]
    );

    console.log('✅ Usuario admin creado exitosamente');
    console.log('');
    console.log('═══════════════════════════════════');
    console.log('  Credenciales de Admin');
    console.log('═══════════════════════════════════');
    console.log('  Usuario:    admin');
    console.log('  Contraseña: admin1234');
    console.log('═══════════════════════════════════');
    console.log('');

    await client.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
