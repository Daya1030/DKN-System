const express = require('express')
const pool = require('../db')

const router = express.Router()

// Get all projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, plan, status, created_at 
      FROM projects 
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, plan, created_by_id } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' })
    }

    const result = await pool.query(
      'INSERT INTO projects (name, description, plan, created_by_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, plan, created_by_id]
    )

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, plan, status } = req.body
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, plan = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, description, plan, status, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// Delete project (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id, name',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json({
      message: 'Project deleted successfully',
      project: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

module.exports = router
