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

    // Detectar si el logo es JPEG o PNG (el compresor suele convertirlos a JPEG)
    let iconType = 'image/png';
    if (config.logo && config.logo.startsWith('data:image/jpeg')) {
      iconType = 'image/jpeg';
    }

    // Usar el Logo como ícono de instalación de la App (PWA)
    const icons = config.logo ? [
      { src: config.logo, sizes: '192x192', type: iconType, purpose: 'any maskable' },
      { src: config.logo, sizes: '512x512', type: iconType, purpose: 'any maskable' }
    ] : [];

    const manifest = {
      name: siteName,
      short_name: shortName,
      description: `Menú interactivo de ${siteName}`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color || '#320A0A',
      theme_color: config.primary_color || '#FF9F0A',
      orientation: 'portrait-primary',
      icons: icons.length > 0 ? icons : undefined,
      categories: ['food', 'lifestyle', 'business'],
      shortcuts: [
        {
          name: 'Ver Menú',
          short_name: 'Menú',
          description: 'Abrir el menú',
          url: '/',
          icons: config.logo ? [{ src: config.logo, sizes: '192x192', type: iconType }] : undefined
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
