import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

// Load environment variables from the correct file
config({ path: '.env.development.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function addPasswordSupport() {
  console.log('🔧 Adding password support to users...\n');

  try {
    // 1. Add password column to users table
    console.log('1. Adding password column to users table...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    `;
    console.log('✅ Password column added successfully!');

    // 2. Set temporary passwords for existing users
    console.log('\n2. Setting temporary passwords for existing users...');
    
    const users = await sql`SELECT id, email FROM users`;
    
    for (const user of users) {
      // Set a default password (you should change these in production)
      const defaultPassword = 'changeme123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword} 
        WHERE id = ${user.id}
      `;
      
      console.log(`✅ Set password for user: ${user.email}`);
    }

    console.log('\n📊 Updated Users with Passwords:');
    const updatedUsers = await sql`
      SELECT 
        u.id, u.name, u.email, u.role, 
        c.name as child_name, u.is_active,
        CASE WHEN u.password_hash IS NOT NULL THEN '✅' ELSE '❌' END as has_password
      FROM users u
      LEFT JOIN children c ON u.child_id = c.id
      ORDER BY u.created_at
    `;
    
    console.table(updatedUsers);

    console.log('\n🎉 Password support added successfully!');
    console.log('🔐 All users now have the temporary password: changeme123');
    console.log('💡 Users should change their passwords after first login');
    
  } catch (error) {
    console.error('❌ Error adding password support:', error);
    process.exit(1);
  }
}

// Run the setup
addPasswordSupport();
