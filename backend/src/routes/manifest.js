const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/manifest.json', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_name, primary_color, background_color FROM site_config WHERE id = 1'
    );

    let config = {};
    if (result.rows.length > 0) {
      config = result.rows[0];
    }

    const siteName = config.site_name || 'Menú Interactivo';
    const shortName = siteName.length > 12 ? siteName.substring(0, 12) : siteName;

    // LA MAGIA: Apuntamos el icono a nuestro nuevo endpoint del backend
    const iconUrl = '/api/site-config/icon';

    const manifest = {
      name: siteName,
      short_name: shortName,
      description: `Menú interactivo de ${siteName} con pedidos por WhatsApp`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color || '#320A0A',
      theme_color: config.primary_color || '#FF9F0A',
      orientation: 'portrait-primary',
      icons: [
        { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    };

    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(manifest);

  } catch (error) {
    console.error('Error generando manifest:', error);
    res.status(500).json({ error: 'Error al generar manifest' });
  }
});

module.exports = router;
