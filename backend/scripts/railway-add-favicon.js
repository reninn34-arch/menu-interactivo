#!/usr/bin/env node

/**
 * Script para agregar columna favicon_url en Railway
 * 
 * Este script se conecta a Railway usando DATABASE_PUBLIC_URL
 * y agrega la columna favicon_url a site_config
 * 
 * Uso en Railway (desde proyecto local):
 *   1. Copia tu DATABASE_PUBLIC_URL de Railway
 *   2. Ejecuta: DATABASE_PUBLIC_URL="tu-url" node backend/scripts/railway-add-favicon.js
 */

const { Pool } = require('pg');

// Usar DATABASE_PUBLIC_URL de Railway o variable de entorno
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: No se encontró DATABASE_PUBLIC_URL');
  console.log('\n📋 Instrucciones:');
  console.log('1. Ve a tu proyecto en Railway');
  console.log('2. Copia la DATABASE_PUBLIC_URL de PostgreSQL');
  console.log('3. Ejecuta:');
  console.log('   DATABASE_PUBLIC_URL="postgresql://..." node backend/scripts/railway-add-favicon.js\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addFaviconColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Conectando a Railway PostgreSQL...\n');
    
    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'site_config' 
        AND column_name = 'favicon_url'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna favicon_url ya existe en Railway.\n');
      return;
    }
    
    console.log('📝 Agregando columna favicon_url a site_config...');
    
    // Agregar la columna favicon_url
    await client.query(`
      ALTER TABLE site_config 
      ADD COLUMN favicon_url TEXT
    `);
    
    console.log('✅ Columna favicon_url agregada exitosamente en Railway!\n');
    
    // Mostrar estructura actualizada
    console.log('📋 Estructura actualizada de site_config:');
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
    
    console.log('\n✅ Migración en Railway completada exitosamente!');
    console.log('💡 Ahora puedes subir el favicon desde el panel de administración.\n');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
addFaviconColumn()
  .then(() => {
    console.log('🎉 Script completado con éxito');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
