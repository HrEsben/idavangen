import { neon } from '@neondatabase/serverless';

// Use a dummy URL for build time if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const sql = neon(databaseUrl);

export async function createUsersTable() {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'No database connection configured' };
  }
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return { success: true };
  } catch (error) {
    console.error('Error creating users table:', error);
    return { success: false, error };
  }
}

export async function getUsers() {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'No database connection configured' };
  }
  
  try {
    const result = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error };
  }
}

export async function createUser(name: string, email: string) {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'No database connection configured' };
  }
  
  try {
    const result = await sql`
      INSERT INTO users (name, email) 
      VALUES (${name}, ${email}) 
      RETURNING *
    `;
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
}
