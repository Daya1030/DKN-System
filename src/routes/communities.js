const express = require('express')
const pool = require('../db')

const router = express.Router()

// Get all communities
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, members_count, created_at 
      FROM communities 
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communities' })
  }
})

// Get community by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM communities WHERE id = $1', [req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Community not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch community' })
  }
})

// Create community
router.post('/', async (req, res) => {
  try {
    const { name, description, created_by_id } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Community name is required' })
    }

    const result = await pool.query(
      'INSERT INTO communities (name, description, created_by_id, members_count) VALUES ($1, $2, $3, 1) RETURNING *',
      [name, description, created_by_id]
    )

    res.status(201).json({
      message: 'Community created successfully',
      community: result.rows[0]
    })
  } catch (error) {
    console.error('Create community error:', error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Community name already exists' })
    }
    res.status(500).json({ error: error.message || 'Failed to create community' })
  }
})

// Join community
router.post('/:id/join', async (req, res) => {
  try {
    const { user_id } = req.body
    const community_id = req.params.id

    // Insert member
    await pool.query(
      'INSERT INTO community_members (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [community_id, user_id]
    )

    // Update member count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM community_members WHERE community_id = $1',
      [community_id]
    )

    await pool.query(
      'UPDATE communities SET members_count = $1 WHERE id = $2',
      [countResult.rows[0].count, community_id]
    )

    res.json({ message: 'Joined community successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to join community' })
  }
})

// Leave community
router.post('/:id/leave', async (req, res) => {
  try {
    const { user_id } = req.body
    const community_id = req.params.id

    // Delete member
    await pool.query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2',
      [community_id, user_id]
    )

    // Update member count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM community_members WHERE community_id = $1',
      [community_id]
    )

    await pool.query(
      'UPDATE communities SET members_count = $1 WHERE id = $2',
      [countResult.rows[0].count, community_id]
    )

    res.json({ message: 'Left community successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave community' })
  }
})

// Notify all users about community event
router.post('/notify-all', async (req, res) => {
  try {
    const { title, message, type } = req.body

    // Get all users
    const usersResult = await pool.query('SELECT id FROM users')
    const users = usersResult.rows

    // Create notification for each user
    for (const user of users) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [user.id, title, message, type]
      )
    }

    res.status(201).json({
      message: 'Notifications sent to all users',
      count: users.length
    })
  } catch (error) {
    console.error('Notify all error:', error)
    res.status(500).json({ error: 'Failed to create notifications' })
  }
})

module.exports = router
