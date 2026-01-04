const pool = require('./db')
const bcrypt = require('bcryptjs')

const seedDefaultUsers = async () => {
  try {
    console.log('🌱 Seeding default users...')

    const users = [
      {
        email: 'admin@dkn.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'Administrator',
        country: 'USA'
      },
      {
        email: 'champion@dkn.com',
        password: 'champion123',
        name: 'Knowledge Champion',
        role: 'KnowledgeChampion',
        country: 'UK'
      },
      {
        email: 'consultant@dkn.com',
        password: 'consultant123',
        name: 'Consultant User',
        role: 'Consultant',
        country: 'Canada'
      },
      {
        email: 'newhire@dkn.com',
        password: 'newhire123',
        name: 'New Hire Employee',
        role: 'NewHire',
        country: 'USA'
      }
    ]

    for (const user of users) {
      try {
        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(user.password, 10)
        
        await pool.query(
          'INSERT INTO users (email, password, name, role, country, active) VALUES ($1, $2, $3, $4, $5, true)',
          [user.email, hashedPassword, user.name, user.role, user.country]
        )
        console.log(`✅ Created user: ${user.email}`)
      } catch (error) {
        if (error.code === '23505') {
          console.log(`⏭️  User already exists: ${user.email}`)
        } else {
          throw error
        }
      }
    }

    console.log('\n✅ Default users seeded successfully!')
    console.log('\nTest Credentials:')
    console.log('- admin@dkn.com / admin123')
    console.log('- champion@dkn.com / champion123')
    console.log('- consultant@dkn.com / consultant123')
    console.log('- newhire@dkn.com / newhire123\n')

  } catch (error) {
    console.error('❌ Error seeding users:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDefaultUsers().then(() => process.exit(0))
}

module.exports = seedDefaultUsers
