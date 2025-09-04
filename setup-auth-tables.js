require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createAuthTables() {
  try {
    console.log('Creating NextAuth v4 tables...');
    
    // Create verification_tokens table (note: different name than Auth.js v5)
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        token TEXT NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `;
    console.log('✓ verification_tokens table created');
    
    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL,
        "userId" INTEGER NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (id)
      )
    `;
    console.log('✓ accounts table created');
    
    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL,
        "sessionToken" TEXT NOT NULL,
        "userId" INTEGER NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (id)
      )
    `;
    console.log('✓ sessions table created');
    
    // Add NextAuth specific columns to existing users table
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMPTZ
    `;
    console.log('✓ Added emailVerified column to users table');
    
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT
    `;
    console.log('✓ Added image column to users table');
    
    console.log('🎉 All NextAuth v4 tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

createAuthTables();
