const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /manifest.json - Genera manifest dinámicamente desde configuración
router.get('/manifest.json', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_name, primary_color, background_color, logo FROM site_config WHERE id = 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const config = result.rows[0];
    const siteName = config.site_name || 'Menú Interactivo';
    const shortName = siteName.length > 12 ? siteName.substring(0, 12) : siteName;

    // Si hay logo configurado, usarlo como icono de la PWA
    // Si no hay logo, no incluir iconos (la PWA usará el favicon o el nombre)
    const icons = config.logo ? [
      {
        src: config.logo,
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: config.logo,
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: config.logo,
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: config.logo,
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: config.logo,
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: config.logo,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: config.logo,
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: config.logo,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ] : [];

    const manifest = {
      name: siteName,
      short_name: shortName,
      description: `Menú interactivo de ${siteName} con pedidos por WhatsApp`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color || '#320A0A',
      theme_color: config.primary_color || '#FF9F0A',
      orientation: 'portrait-primary',
      icons: icons.length > 0 ? icons : undefined, // Si no hay iconos, no incluir la propiedad
      categories: ['food', 'lifestyle', 'business'],
      shortcuts: [
        {
          name: 'Ver Menú',
          short_name: 'Menú',
          description: 'Abrir el menú completo',
          url: '/',
          icons: [{ src: '/icon-192x192.svg', sizes: '192x192' }]
        }
      ]
    };

    // Establecer headers para JSON con charset UTF-8 y NO cachear
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json(manifest);

  } catch (error) {
    console.error('Error generando manifest:', error);
    res.status(500).json({ error: 'Error al generar manifest' });
  }
});

module.exports = router;
