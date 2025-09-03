#!/usr/bin/env node

/**
 * Simple database testing script for Neon
 * Run with: node test-db.js
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables from .env.development.local
config({ path: '.env.development.local' });

const sql = neon(process.env.DATABASE_URL);

async function testDatabase() {
  console.log('🔍 Testing Neon Database Connection...\n');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    console.log('✅ Connected successfully!');
    console.log(`   Time: ${connectionTest[0].current_time}`);
    console.log(`   Version: ${connectionTest[0].postgres_version.split(' ').slice(0, 2).join(' ')}\n`);
    
    // Create table if not exists
    console.log('2. Creating users table if not exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Table ready!\n');
    
    // Check if table has data
    console.log('3. Checking existing data...');
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`   Current users: ${userCount[0].count}\n`);
    
    // Show table structure
    console.log('4. Table structure:');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.table(tableInfo);
    
    // Show recent users if any
    if (parseInt(userCount[0].count) > 0) {
      console.log('5. Recent users:');
      const recentUsers = await sql`
        SELECT id, name, email, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      console.table(recentUsers);
    }
    
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

// Add sample data function
async function addSampleData() {
  console.log('\n📝 Adding sample data...');
  
  try {
    const sampleUsers = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Smith', email: 'bob@example.com' },
      { name: 'Carol Wilson', email: 'carol@example.com' }
    ];
    
    for (const user of sampleUsers) {
      try {
        await sql`
          INSERT INTO users (name, email) 
          VALUES (${user.name}, ${user.email})
          ON CONFLICT (email) DO NOTHING
        `;
        console.log(`✅ Added: ${user.name}`);
      } catch (err) {
        console.log(`⚠️  Skipped: ${user.name} (already exists)`);
      }
    }
    
    console.log('\n📊 Updated user list:');
    const allUsers = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    console.table(allUsers);
    
  } catch (error) {
    console.error('❌ Failed to add sample data:', error.message);
  }
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'sample') {
  testDatabase().then(() => addSampleData());
} else {
  testDatabase();
}

console.log('\n💡 Usage:');
console.log('  node test-db.js       - Test connection and show data');
console.log('  node test-db.js sample - Test connection and add sample data');
