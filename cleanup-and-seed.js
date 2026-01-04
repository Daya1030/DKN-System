const pool = require('./src/db')
const bcrypt = require('bcryptjs')

const main = async () => {
  try {
    console.log('🗑️  Deleting old test users...')
    await pool.query(
      "DELETE FROM users WHERE email IN ('admin@dkn.com', 'champion@dkn.com', 'consultant@dkn.com', 'newhire@dkn.com')"
    )
    console.log('✅ Old users deleted\n')

    console.log('🌱 Seeding new users with hashed passwords...')

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
      const hashedPassword = await bcrypt.hash(user.password, 10)
      await pool.query(
        'INSERT INTO users (email, password, name, role, country, active) VALUES ($1, $2, $3, $4, $5, true)',
        [user.email, hashedPassword, user.name, user.role, user.country]
      )
      console.log(`✅ Created user: ${user.email}`)
    }

    console.log('\n✅ All done! Test credentials:')
    console.log('- admin@dkn.com / admin123')
    console.log('- champion@dkn.com / champion123')
    console.log('- consultant@dkn.com / consultant123')
    console.log('- newhire@dkn.com / newhire123\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
