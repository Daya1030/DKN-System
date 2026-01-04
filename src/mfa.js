const nodemailer = require('nodemailer')

// Store MFA codes in memory (in production, use Redis or database)
const mfaCodes = new Map()

// Email transporter configuration - using test/console transport for development
// In production, use real Mailtrap or SendGrid credentials
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false,
  tls: { rejectUnauthorized: false }
})

// Test transport for development - logs emails to console
const testTransporter = {
  sendMail: async (mailOptions) => {
    console.log('📧 TEST EMAIL (Console) being "sent":')
    console.log('  To:', mailOptions.to)
    console.log('  Subject:', mailOptions.subject)
    console.log('  Content:', mailOptions.html ? '(HTML content)' : mailOptions.text)
    return {
      response: '250 Message logged to console',
      accepted: [mailOptions.to]
    }
  }
}

// Use test transporter in development (logs to console instead of sending via SMTP)
const activeTransporter = process.env.NODE_ENV === 'production' ? transporter : testTransporter

// Log transporter configuration on module load
console.log('📧 Email Transport Config:')
console.log('  Mode:', process.env.NODE_ENV === 'production' ? 'Production (Mailtrap/SMTP)' : 'Development (Console)')
console.log('  Host:', process.env.MAILTRAP_HOST || 'console (logged to terminal)')
console.log('  User:', process.env.MAILTRAP_USER || 'N/A')

// Generate random 6-digit code
const generateMFACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send MFA code via email
const sendMFACode = async (email, name) => {
  try {
    console.log('🔄 Attempting to send MFA code to:', email)
    const code = generateMFACode()
    
    // Store code with 5-minute expiry
    mfaCodes.set(email, {
      code,
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000
    })

    const mailOptions = {
      from: 'dkn@mailtrap.io',
      to: email,
      subject: 'DKN Platform - Your MFA Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #001f3f, #0047ab); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔐 DKN Security</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e0e7ff;">
            <p style="color: #333; margin-bottom: 10px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #666; margin-bottom: 20px;">Your MFA verification code is:</p>
            <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #001f3f; letter-spacing: 4px; font-family: monospace;">
                ${code}
              </div>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">This code will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">If you did not request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e7ff; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2025 DKN Knowledge Platform. All rights reserved.</p>
          </div>
        </div>
      `
    }

    console.log('📤 Sending email...')
    const info = await activeTransporter.sendMail(mailOptions)
    console.log('✅ MFA Email sent successfully')
    console.log(`🔐 MFA CODE FOR ${email}: ${code}`)
    console.log('📧 Code stored (expires in 5 minutes)')
    
    return code
  } catch (error) {
    console.error('❌ CRITICAL ERROR sending MFA email:')
    console.error('   Error Message:', error.message)
    console.error('   Error Code:', error.code)
    console.error('   Error Response:', error.response)
    console.error('   Full Error:', JSON.stringify(error, null, 2))
    throw error
  }
}

// Verify MFA code
const verifyMFACode = (email, code) => {
  const stored = mfaCodes.get(email)
  
  if (!stored) {
    return { valid: false, message: 'No MFA code found. Please request a new one.' }
  }
  
  if (stored.expiresAt < Date.now()) {
    mfaCodes.delete(email)
    return { valid: false, message: 'MFA code expired. Please request a new one.' }
  }
  
  stored.attempts += 1
  if (stored.attempts > 5) {
    mfaCodes.delete(email)
    return { valid: false, message: 'Too many attempts. Please request a new code.' }
  }
  
  if (stored.code !== code) {
    return { valid: false, message: `Invalid code. ${5 - stored.attempts} attempts remaining.` }
  }
  
  mfaCodes.delete(email)
  return { valid: true, message: 'MFA verified successfully!' }
}

// Clear expired codes periodically
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of mfaCodes.entries()) {
    if (data.expiresAt < now) {
      mfaCodes.delete(email)
    }
  }
}, 60000) // Check every minute

module.exports = {
  sendMFACode,
  verifyMFACode,
  generateMFACode
}
