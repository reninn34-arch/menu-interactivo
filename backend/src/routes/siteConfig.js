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

router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      site_name, tagline, logo, logo_width, logo_height,
      primary_color, secondary_color, background_color, text_color, accent_color,
      branch_name, currency, currency_symbol,
      whatsapp_number, whatsapp_number_pickup, whatsapp_number_delivery,
      restaurant_address, delivery_cost, allow_orders_outside_hours, opening_hours
    } = req.body;
    
    const result = await pool.query(
      `UPDATE site_config 
       SET site_name = $1, tagline = $2, logo = $3, logo_width = $4, logo_height = $5,
           primary_color = $6, secondary_color = $7, background_color = $8, 
           text_color = $9, accent_color = $10, branch_name = $11, currency = $12,
           currency_symbol = $13, whatsapp_number = $14, whatsapp_number_pickup = $15,
           whatsapp_number_delivery = $16, restaurant_address = $17, delivery_cost = $18,
           allow_orders_outside_hours = $19, opening_hours = $20
       WHERE id = 1 
       RETURNING *`,
      [
        site_name, tagline, logo, logo_width, logo_height,
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
