const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetPassword() {
  try {
    const newPassword = '1234';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = 'UPDATE users SET password_hash = $1 WHERE username = $2';
    const result = await pool.query(query, [hashedPassword, 'testuser']);

    if (result.rowCount > 0) {
      console.log('✅ Password reset successful!');
      console.log('Username: testuser');
      console.log('Password: 1234');
    } else {
      console.log('❌ User not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
