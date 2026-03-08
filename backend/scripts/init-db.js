const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  // Primero conectar a postgres por defecto para crear la base de datos
  const defaultClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // conectar a la base postgres por defecto
  });

  try {
    console.log('📦 Conectando a PostgreSQL...');
    await defaultClient.connect();

    // Verificar si la base de datos existe
    const dbName = process.env.DB_NAME || 'menu_interactivo';
    const checkDb = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`🔨 Creando base de datos ${dbName}...`);
      await defaultClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de datos ${dbName} creada`);
    } else {
      console.log(`✅ Base de datos ${dbName} ya existe`);
    }

    await defaultClient.end();

    // Ahora conectar a la base de datos del proyecto
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName
    });

    await client.connect();
    console.log(`📦 Conectado a base de datos ${dbName}`);

    // Leer y ejecutar el schema SQL
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔨 Ejecutando schema SQL...');
    await client.query(schema);
    console.log('✅ Schema ejecutado correctamente');

    // Verificar tablas creadas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`\n✅ Tablas creadas (${tables.rows.length}):`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    await client.end();
    console.log('\n🎉 Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
