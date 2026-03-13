const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM option_groups ORDER BY order_index ASC'
    );
    
    const groupsWithValues = await Promise.all(
      result.rows.map(async (group) => {
        const valuesResult = await pool.query(
          'SELECT * FROM option_values WHERE option_group_id = $1 ORDER BY order_index ASC',
          [group.id]
        );
        return {
          ...group,
          values: valuesResult.rows
        };
      })
    );
    
    res.json(groupsWithValues);
  } catch (error) {
    console.error('Error fetching option groups:', error);
    res.status(500).json({ error: 'Failed to fetch option groups' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM option_groups WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Option group not found' });
    }
    
    const group = result.rows[0];
    const valuesResult = await pool.query(
      'SELECT * FROM option_values WHERE option_group_id = $1 ORDER BY order_index ASC',
      [id]
    );
    
    group.values = valuesResult.rows;
    res.json(group);
  } catch (error) {
    console.error('Error fetching option group:', error);
    res.status(500).json({ error: 'Failed to fetch option group' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { 
      id, name, description, required, multi_select, min_selections, 
      max_selections, enabled, order_index, values 
    } = req.body;
    
    const result = await client.query(
      `INSERT INTO option_groups 
       (id, name, description, required, multi_select, min_selections, max_selections, enabled, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [id, name, description, required || false, multi_select || false, 
       min_selections, max_selections, enabled !== undefined ? enabled : true, order_index]
    );
    
    const group = result.rows[0];
    
    if (values && values.length > 0) {
      for (const value of values) {
        await client.query(
          `INSERT INTO option_values 
           (id, option_group_id, name, price_modifier, enabled, order_index, image, style, calories, protein, fat, carbs) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [value.id, id, value.name, value.price_modifier || 0, 
           value.enabled !== undefined ? value.enabled : true, value.order_index,
           value.image, value.style, value.calories, value.protein, value.fat, value.carbs]
        );
      }
    }
    
    await client.query('COMMIT');
    
    const valuesResult = await pool.query(
      'SELECT * FROM option_values WHERE option_group_id = $1 ORDER BY order_index ASC',
      [id]
    );
    group.values = valuesResult.rows;
    
    res.status(201).json(group);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating option group:', error);
    res.status(500).json({ error: 'Failed to create option group' });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { 
      name, description, required, multi_select, min_selections, 
      max_selections, enabled, order_index, values 
    } = req.body;
    
    const result = await client.query(
      `UPDATE option_groups 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           required = COALESCE($3, required), 
           multi_select = COALESCE($4, multi_select), 
           min_selections = COALESCE($5, min_selections), 
           max_selections = COALESCE($6, max_selections), 
           enabled = COALESCE($7, enabled), 
           order_index = COALESCE($8, order_index)
       WHERE id = $9 
       RETURNING *`,
      [name ?? null, description ?? null, required ?? null, multi_select ?? null, 
       min_selections ?? null, max_selections ?? null, enabled ?? null, order_index ?? null, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Option group not found' });
    }
    
    const group = result.rows[0];
    
    await client.query('DELETE FROM option_values WHERE option_group_id = $1', [id]);
    
    if (values && values.length > 0) {
      for (const value of values) {
        await client.query(
          `INSERT INTO option_values 
           (id, option_group_id, name, price_modifier, enabled, order_index, image, style, calories, protein, fat, carbs) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [value.id, id, value.name, value.price_modifier || 0, 
           value.enabled !== undefined ? value.enabled : true, value.order_index,
           value.image, value.style, value.calories, value.protein, value.fat, value.carbs]
        );
      }
    }
    
    await client.query('COMMIT');
    
    const valuesResult = await pool.query(
      'SELECT * FROM option_values WHERE option_group_id = $1 ORDER BY order_index ASC',
      [id]
    );
    group.values = valuesResult.rows;
    
    res.json(group);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating option group:', error);
    res.status(500).json({ error: 'Failed to update option group' });
  } finally {
    client.release();
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM option_groups WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Option group not found' });
    }
    
    res.json({ message: 'Option group deleted successfully' });
  } catch (error) {
    console.error('Error deleting option group:', error);
    res.status(500).json({ error: 'Failed to delete option group' });
  }
});

module.exports = router;
