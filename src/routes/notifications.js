const express = require('express')
const pool = require('../db')

const router = express.Router()

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// Create notification
router.post('/', async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body

    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, message, type]
    )

    res.status(201).json({
      message: 'Notification created',
      notification: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' })
  }
})

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' })
  }
})

module.exports = router
