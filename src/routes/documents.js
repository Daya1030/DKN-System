const express = require('express')
const pool = require('../db')

const router = express.Router()

// Get all documents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, file_name, uploaded_by_role, uploaded_at, status, tags 
      FROM documents 
      ORDER BY uploaded_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' })
  }
})

// Upload document
router.post('/', async (req, res) => {
  try {
    const { title, description, file_name, file_content, uploaded_by_id, uploaded_by_role, tags } = req.body

    const result = await pool.query(
      `INSERT INTO documents (title, description, file_name, file_content, uploaded_by_id, uploaded_by_role, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, file_name, status`,
      [title, description, file_name, file_content, uploaded_by_id, uploaded_by_role, tags || [], 'pending']
    )

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload document' })
  }
})

// Approve document
router.patch('/:id/approve', async (req, res) => {
  try {
    const { approved_by_id } = req.body
    const result = await pool.query(
      'UPDATE documents SET status = $1, approved_by_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['approved', approved_by_id, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve document' })
  }
})

// Reject document
router.patch('/:id/reject', async (req, res) => {
  try {
    const { rejection_reason } = req.body
    const result = await pool.query(
      'UPDATE documents SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      ['rejected', rejection_reason, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject document' })
  }
})

// Delete document (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING id, title',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' })
    }

    res.json({
      message: 'Document deleted successfully',
      document: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

module.exports = router
