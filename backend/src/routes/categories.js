const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY order_index ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id, name, description, icon, enabled, order_index, image, is_main } = req.body;
    // Si esta es la principal, quitamos el estado principal a todas las demás
    if (is_main) {
      await client.query('UPDATE categories SET is_main = FALSE');
    }
    const result = await client.query(
      `INSERT INTO categories (id, name, description, icon, enabled, order_index, image, is_main) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [id, name, description, icon, enabled !== undefined ? enabled : true, order_index, image, is_main || false]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { name, description, icon, enabled, order_index, image, is_main } = req.body;
    // Si esta es la principal, quitamos el estado principal a todas las demás
    if (is_main) {
      await client.query('UPDATE categories SET is_main = FALSE WHERE id != $1', [id]);
    }
    const result = await client.query(
      `UPDATE categories 
       SET name = $1, description = $2, icon = $3, enabled = $4, order_index = $5, image = $6, is_main = $7
       WHERE id = $8 
       RETURNING *`,
      [name, description, icon, enabled, order_index, image, is_main || false, id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Category not found' });
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  } finally {
    client.release();
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
