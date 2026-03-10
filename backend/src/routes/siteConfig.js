const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

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

router.put('/', authenticateToken, async (req, res) => {
  try {
    let {
      site_name, tagline, logo, logo_width, logo_height, favicon_url,
      primary_color, secondary_color, background_color, text_color, accent_color,
      branch_name, currency, currency_symbol,
      whatsapp_number, whatsapp_number_pickup, whatsapp_number_delivery,
      restaurant_address, delivery_cost, allow_orders_outside_hours, opening_hours
    } = req.body;
    
    const publicDir = path.join(__dirname, '..', '..', '..', 'public');
    const pwaIconPath = path.join(publicDir, 'pwa-icon.png');
    
    // Si el logo está vacío o null, eliminar archivo físico
    if (!logo || logo === '') {
      try {
        if (fs.existsSync(pwaIconPath)) {
          fs.unlinkSync(pwaIconPath);
          console.log('🗑️ Logo eliminado: pwa-icon.png');
        }
      } catch (error) {
        console.error('Error eliminando logo:', error);
      }
      logo = null; // Guardar como null en la BD
    }
    // Si el logo es base64, guardarlo como archivo en public/
    else if (logo && logo.startsWith('data:image')) {
      try {
        // Extraer tipo de imagen y datos base64
        const matches = logo.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const imageType = matches[1]; // png, jpg, etc.
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Crear directorio si no existe
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          
          // Guardar como pwa-icon.png (siempre PNG para compatibilidad)
          fs.writeFileSync(pwaIconPath, buffer);
          
          // Actualizar logo con la ruta del archivo
          logo = '/pwa-icon.png';
          console.log(`✅ Logo guardado en: ${pwaIconPath}`);
        }
      } catch (error) {
        console.error('Error guardando logo como archivo:', error);
        // Si falla, continuar con base64
      }
    }
    
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
