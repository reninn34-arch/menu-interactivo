const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_config WHERE id = 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site configuration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ error: 'Failed to fetch site configuration' });
  }
});

// GET /api/site-config/icon - Transforma el Base64 de la BD en un archivo de imagen en vivo
router.get('/icon', async (req, res) => {
  try {
    const result = await pool.query('SELECT logo, favicon_url FROM site_config WHERE id = 1');
    
    if (result.rows.length > 0) {
      const config = result.rows[0];
      // Preferimos el favicon (cuadrado), pero si no hay, usamos el logo
      const iconSource = config.favicon_url || config.logo;
      
      if (iconSource && iconSource.startsWith('data:image')) {
        // Separamos el formato (png/jpeg) de los datos binarios
        const matches = iconSource.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          
          res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); 
            res.setHeader('Access-Control-Allow-Origin', '*'); // <--- NUEVO: REQUISITO PWA
          return res.send(buffer);
        }
      }
    }
    
    // Si no hay imagen en la BD o falló, redirigimos al icono por defecto de React
    res.redirect('/pwa-icon.png');
  } catch (error) {
    res.redirect('/pwa-icon.png');
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    let {
      site_name, tagline, logo, logo_width, logo_height, favicon_url,
      primary_color, secondary_color, background_color, text_color, accent_color,
      branch_name, currency, currency_symbol,
      whatsapp_number, whatsapp_number_pickup, whatsapp_number_delivery,
      restaurant_address, delivery_cost, allow_orders_outside_hours, opening_hours
    } = req.body;
    
    // Ya NO guardamos archivos físicos. El frontend ya comprime el logo a Base64,
    // así que lo guardamos directo en la Base de Datos para evitar problemas en Railway.
    
    const result = await pool.query(
      `UPDATE site_config 
       SET site_name = $1, tagline = $2, logo = $3, logo_width = $4, logo_height = $5,
           favicon_url = $6,
           primary_color = $7, secondary_color = $8, background_color = $9, 
           text_color = $10, accent_color = $11, branch_name = $12, currency = $13,
           currency_symbol = $14, whatsapp_number = $15, whatsapp_number_pickup = $16,
           whatsapp_number_delivery = $17, restaurant_address = $18, delivery_cost = $19,
           allow_orders_outside_hours = $20, opening_hours = $21
       WHERE id = 1 
       RETURNING *`,
      [
        site_name, tagline, logo, logo_width, logo_height, favicon_url,
        primary_color, secondary_color, background_color, text_color, accent_color,
        branch_name, currency, currency_symbol,
        whatsapp_number, whatsapp_number_pickup, whatsapp_number_delivery,
        restaurant_address, delivery_cost, allow_orders_outside_hours,
        opening_hours ? JSON.stringify(opening_hours) : null
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site configuration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(500).json({ error: 'Failed to update site configuration' });
  }
});

module.exports = router;
