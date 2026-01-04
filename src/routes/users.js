const express = require('express')
const pool = require('../db')

const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, country, active, created_at FROM users ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, country, active FROM users WHERE id = $1', [req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, role, country, active } = req.body
    const result = await pool.query(
      'UPDATE users SET name = $1, role = $2, country = $3, active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, role, country, active, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Toggle user active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET active = NOT active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, active',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

module.exports = router
