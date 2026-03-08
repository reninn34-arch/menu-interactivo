const { Client } = require('pg');
require('dotenv').config();

async function deleteAdmin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'menu_interactivo'
  });

  try {
    await client.connect();
    await client.query("DELETE FROM users WHERE username = 'admin'");
    console.log('✅ Usuario admin eliminado');
    await client.end();
  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  }
}

deleteAdmin();
