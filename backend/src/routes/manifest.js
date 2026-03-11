const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/manifest.json', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_name, primary_color, background_color, logo, favicon_url, extract(epoch from updated_at) as last_update FROM site_config WHERE id = 1'
    );

    let config = {};
    if (result.rows.length > 0) {
      config = result.rows[0];
    }

    const siteName = config.site_name || 'Menú Interactivo';
    const shortName = siteName.length > 12 ? siteName.substring(0, 12) : siteName;

    // ✅ CORRECCIÓN: Prioridad al Favicon (cuadrado)
    const iconSource = config.favicon_url || config.logo;
    let iconType = 'image/png';
    if (iconSource && iconSource.startsWith('data:image/jpeg')) {
      iconType = 'image/jpeg';
    }

    const version = config.last_update || Date.now();
    const iconUrl = `/api/site-config/icon?v=${version}`;

    const manifest = {
      name: siteName,
      short_name: shortName,
      description: `Menú interactivo de ${siteName}`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color || '#320A0A',
      theme_color: config.primary_color || '#FF9F0A',
      orientation: 'portrait-primary',
      // Quitamos el "purpose: any maskable" para evitar deformaciones
      icons: [
        { src: iconUrl, sizes: '192x192', type: iconType, purpose: 'any' },
        { src: iconUrl, sizes: '512x512', type: iconType, purpose: 'any' }
      ],
      categories: ['food', 'lifestyle', 'business'],
      shortcuts: [
        {
          name: 'Ver Menú',
          short_name: 'Menú',
          description: 'Abrir el menú',
          url: '/',
          icons: [{ src: iconUrl, sizes: '192x192', type: iconType }]
        }
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
