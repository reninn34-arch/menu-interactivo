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
    // Si no hay logo, usar los iconos SVG genéricos
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
    ] : [
      {
        src: '/icon-72x72.svg',
        sizes: '72x72',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-96x96.svg',
        sizes: '96x96',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-128x128.svg',
        sizes: '128x128',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-144x144.svg',
        sizes: '144x144',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-152x152.svg',
        sizes: '152x152',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-384x384.svg',
        sizes: '384x384',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ];

    const manifest = {
      name: siteName,
      short_name: shortName,
      description: `Menú interactivo de ${siteName} con pedidos por WhatsApp`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color || '#320A0A',
      theme_color: config.primary_color || '#FF9F0A',
      orientation: 'portrait-primary',
      icons: icons,
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

    // Establecer headers para JSON con charset UTF-8
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.json(manifest);

  } catch (error) {
    console.error('Error generando manifest:', error);
    res.status(500).json({ error: 'Error al generar manifest' });
  }
});

module.exports = router;
