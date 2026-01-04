const express = require('express')
const cors = require('cors')
require('dotenv').config()
const initializeDatabase = require('./schema')

// Import route handlers
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const documentRoutes = require('./routes/documents')
const projectRoutes = require('./routes/projects')
const communityRoutes = require('./routes/communities')
const notificationRoutes = require('./routes/notifications')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Initialize database schema on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err)
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: '✅ Backend is running', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 DKN Backend running on http://localhost:${PORT}`)
  console.log(`📝 API Documentation available at http://localhost:${PORT}/api/\n`)
})
