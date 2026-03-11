const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/manifest.json', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_name, primary_color, background_color, logo, favicon_url, extract(epoch from updated_at) as last_update FROM site_config WHERE id = 1'
    );

    let config = result.rows[0] || {};
    const siteName = config.site_name || 'Menú Interactivo';
    const shortName = siteName.length > 12 ? siteName.substring(0, 12) : siteName;

    // Prioridad: Favicon (cuadrado) > Logo
    const iconSource = config.favicon_url || config.logo;
    let iconType = 'image/png';
    if (iconSource && iconSource.startsWith('data:image/jpeg')) {
      iconType = 'image/jpeg';
    }

    const version = config.last_update || Date.now();
    // TRUCO PARA CHROME: Hacer que las URLs parezcan archivos distintos
    const icon192 = `/api/site-config/icon?v=${version}&size=192`;
    const icon512 = `/api/site-config/icon?v=${version}&size=512`;

    const manifest = {
      name: siteName,
      short_name: shortName,
      description: `Menú interactivo de ${siteName}`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color || '#320A0A',
      theme_color: config.primary_color || '#FF9F0A',
      orientation: 'portrait-primary',
      // ARREGLO ESTRICTO: Separar "any" y "maskable" en objetos distintos
      icons: [
        { src: icon192, sizes: '192x192', type: iconType, purpose: 'any' },
        { src: icon512, sizes: '512x512', type: iconType, purpose: 'any' },
        { src: icon192, sizes: '192x192', type: iconType, purpose: 'maskable' },
        { src: icon512, sizes: '512x512', type: iconType, purpose: 'maskable' }
      ],
      categories: ['food', 'lifestyle', 'business'],
      shortcuts: [
        {
          name: 'Ver Menú',
          short_name: 'Menú',
          url: '/',
          icons: [{ src: icon192, sizes: '192x192', type: iconType }]
        }
      ]
    };

    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*'); // REQUISITO DE SEGURIDAD
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(manifest);
  } catch (error) {
    console.error('Error generando manifest:', error);
    res.status(500).json({ error: 'Error al generar manifest' });
  }
});

module.exports = router;
