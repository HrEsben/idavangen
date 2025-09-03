import { sql } from '@vercel/postgres';

export async function createUsersTable() {
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
  try {
    const result = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error };
  }
}

export async function createUser(name: string, email: string) {
  try {
    const result = await sql`
      INSERT INTO users (name, email) 
      VALUES (${name}, ${email}) 
      RETURNING *
    `;
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
}
