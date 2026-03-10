#!/usr/bin/env node

/**
 * Script de migración: Agregar columna favicon_url a site_config
 * 
 * Este script agrega la columna favicon_url a la tabla site_config
 * para permitir que los usuarios suban un favicon personalizado.
 * 
 * Uso:
 *   node backend/scripts/add-favicon-column.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'menu_interactivo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addFaviconColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migración: Agregar columna favicon_url...\n');
    
    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'site_config' 
        AND column_name = 'favicon_url'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna favicon_url ya existe. No es necesario migrar.\n');
      return;
    }
    
    // Agregar la columna favicon_url
    console.log('📝 Agregando columna favicon_url a site_config...');
    await client.query(`
      ALTER TABLE site_config 
      ADD COLUMN favicon_url TEXT
    `);
    
    console.log('✅ Columna favicon_url agregada exitosamente!\n');
    console.log('📋 Nueva estructura de site_config:');
    
    // Mostrar las columnas de la tabla
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'site_config'
      ORDER BY ordinal_position
    `);
    
    columns.rows.forEach(col => {
      const mark = col.column_name === 'favicon_url' ? '🆕' : '  ';
      console.log(`${mark} ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log('💡 Ahora puedes subir un favicon desde el panel de administración.\n');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
addFaviconColumn()
  .then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
