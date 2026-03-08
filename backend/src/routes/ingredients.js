const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ingredients ORDER BY order_index ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ingredients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch ingredient' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, name, type, enabled, order_index, is_variable } = req.body;
    
    const result = await pool.query(
      `INSERT INTO ingredients (id, name, type, enabled, order_index, is_variable) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [id, name, type, enabled !== undefined ? enabled : true, order_index, is_variable || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, enabled, order_index, is_variable } = req.body;
    
    const result = await pool.query(
      `UPDATE ingredients 
       SET name = $1, type = $2, enabled = $3, order_index = $4, is_variable = $5
       WHERE id = $6 
       RETURNING *`,
      [name, type, enabled, order_index, is_variable, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM ingredients WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

module.exports = router;
