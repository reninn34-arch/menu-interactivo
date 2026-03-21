const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verificar contraseña actual (para validación en tiempo real)
router.post('/verify-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required', valid: false });
    }

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found', valid: false });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    res.json({ valid: validPassword });
  } catch (error) {
    console.error('Verify password error:', error);
    res.status(500).json({ error: 'Internal server error', valid: false });
  }
});

// ✅ Issue 3: Protected route – only an authenticated admin can create new users.
// Without a valid JWT token this returns 401 Unauthorized.
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Actualizar credenciales del usuario autenticado
router.put('/update-credentials', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newUsername, newPassword } = req.body;

    // Validar que se envió la contraseña actual
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    // Validar que al menos se quiera cambiar algo
    if (!newUsername && !newPassword) {
      return res.status(400).json({ error: 'You must provide a new username or password' });
    }

    // Verificar usuario actual y contraseña
    const userResult = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    let valueIndex = 1;
    const updates = [];

    // Cambiar usuario si se proporcionó
    if (newUsername) {
      if (newUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      // Verificar que el nuevo usuario no exista (excepto el actual)
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [newUsername, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      updates.push(`username = $${valueIndex}`);
      updateValues.push(newUsername);
      valueIndex++;
    }

    // Cambiar contraseña si se proporcionó
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      updates.push(`password_hash = $${valueIndex}`);
      updateValues.push(newPasswordHash);
      valueIndex++;
    }

    // Construir y ejecutar la query
    updateQuery += updates.join(', ');
    updateQuery += `, updated_at = NOW() WHERE id = $${valueIndex} RETURNING id, username`;
    updateValues.push(userId);

    const result = await pool.query(updateQuery, updateValues);
    const updatedUser = result.rows[0];

    // Generar nuevo token con el username actualizado
    const newToken = jwt.sign(
      { id: updatedUser.id, username: updatedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Credentials updated successfully',
      token: newToken,
      user: {
        id: updatedUser.id,
        username: updatedUser.username
      }
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
