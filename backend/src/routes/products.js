const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products_full ORDER BY order_index ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = result.rows[0];
    
    const optionsResult = await pool.query(
      'SELECT og.* FROM option_groups og JOIN product_options po ON og.id = po.option_group_id WHERE po.product_id = $1',
      [id]
    );
    product.option_groups = optionsResult.rows;
    
    const ingredientsResult = await pool.query(
      'SELECT i.* FROM ingredients i JOIN product_ingredients pi ON i.id = pi.ingredient_id WHERE pi.product_id = $1',
      [id]
    );
    product.ingredients = ingredientsResult.rows;
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { 
      id, category_id, name, description, price, image, enabled, featured,
      order_index, use_layered_view, variable_ingredient_id, linked_option_group_id,
      in_stock, estimated_time, nutritional_info, option_groups, ingredients
    } = req.body;
    
    const result = await client.query(
      `INSERT INTO products 
       (id, category_id, name, description, price, image, enabled, featured, 
        order_index, use_layered_view, variable_ingredient_id, linked_option_group_id,
        in_stock, estimated_time, nutritional_info) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [id, category_id, name, description, price, image, enabled !== undefined ? enabled : true,
       featured || false, order_index, use_layered_view || false, variable_ingredient_id,
       linked_option_group_id, in_stock !== undefined ? in_stock : true, estimated_time,
       nutritional_info ? JSON.stringify(nutritional_info) : null]
    );
    
    if (option_groups && option_groups.length > 0) {
      for (const groupId of option_groups) {
        await client.query(
          'INSERT INTO product_options (product_id, option_group_id) VALUES ($1, $2)',
          [id, groupId]
        );
      }
    }
    
    if (ingredients && ingredients.length > 0) {
      for (const ingredientId of ingredients) {
        await client.query(
          'INSERT INTO product_ingredients (product_id, ingredient_id) VALUES ($1, $2)',
          [id, ingredientId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
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
      category_id, name, description, price, image, enabled, featured,
      order_index, use_layered_view, variable_ingredient_id, linked_option_group_id,
      in_stock, estimated_time, nutritional_info, option_groups, ingredients
    } = req.body;
    
    const result = await client.query(
      `UPDATE products 
       SET category_id = $1, name = $2, description = $3, price = $4, image = $5, 
           enabled = $6, featured = $7, order_index = $8, use_layered_view = $9,
           variable_ingredient_id = $10, linked_option_group_id = $11, in_stock = $12,
           estimated_time = $13, nutritional_info = $14
       WHERE id = $15 
       RETURNING *`,
      [category_id, name, description, price, image, enabled, featured, order_index,
       use_layered_view, variable_ingredient_id, linked_option_group_id, in_stock,
       estimated_time, nutritional_info ? JSON.stringify(nutritional_info) : null, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await client.query('DELETE FROM product_options WHERE product_id = $1', [id]);
    if (option_groups && option_groups.length > 0) {
      for (const groupId of option_groups) {
        await client.query(
          'INSERT INTO product_options (product_id, option_group_id) VALUES ($1, $2)',
          [id, groupId]
        );
      }
    }
    
    await client.query('DELETE FROM product_ingredients WHERE product_id = $1', [id]);
    if (ingredients && ingredients.length > 0) {
      for (const ingredientId of ingredients) {
        await client.query(
          'INSERT INTO product_ingredients (product_id, ingredient_id) VALUES ($1, $2)',
          [id, ingredientId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  } finally {
    client.release();
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
