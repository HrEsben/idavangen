import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from the correct file
config({ path: '.env.development.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function setupRoleSystem() {
  console.log('🔧 Setting up user role system...\n');

  try {
    // 1. Create children table
    console.log('1. Creating children table...');
    await sql`
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        birth_date DATE,
        created_by INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Children table created successfully!');

    // 2. Update users table to include roles
    console.log('\n2. Adding role columns to users table...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'parent',
      ADD COLUMN IF NOT EXISTS child_id INTEGER,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `;
    console.log('✅ Users table updated successfully!');

    // 3. Create user permissions table
    console.log('\n3. Creating user permissions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        child_id INTEGER NOT NULL,
        can_read BOOLEAN DEFAULT true,
        can_write BOOLEAN DEFAULT false,
        can_read_sensitive BOOLEAN DEFAULT false,
        granted_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, child_id)
      );
    `;
    console.log('✅ User permissions table created successfully!');

    // 4. Update log_entries table to reference child
    console.log('\n4. Adding child reference to log_entries...');
    await sql`
      ALTER TABLE log_entries 
      ADD COLUMN IF NOT EXISTS child_id INTEGER,
      ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT false;
    `;
    console.log('✅ Log entries table updated successfully!');

    // 5. Create sample users
    console.log('\n5. Creating sample users...');
    
    // Super admin
    const superAdminResult = await sql`
      INSERT INTO users (name, email, role) 
      VALUES ('Super Administrator', 'superadmin@idavang.dk', 'super_admin') 
      ON CONFLICT (email) DO UPDATE SET role = 'super_admin'
      RETURNING *
    `;
    console.log('✅ Super admin created!');

    // Parent user
    const parentResult = await sql`
      INSERT INTO users (name, email, role) 
      VALUES ('Mor/Far', 'foraelder@idavang.dk', 'parent') 
      ON CONFLICT (email) DO UPDATE SET role = 'parent'
      RETURNING *
    `;
    const parentId = parentResult[0]?.id || (await sql`SELECT id FROM users WHERE email = 'foraelder@idavang.dk'`)[0].id;
    console.log('✅ Parent user created!');

    // Teacher user
    const teacherResult = await sql`
      INSERT INTO users (name, email, role) 
      VALUES ('Lærer Hansen', 'laerer@skole.dk', 'teacher') 
      ON CONFLICT (email) DO UPDATE SET role = 'teacher'
      RETURNING *
    `;
    console.log('✅ Teacher user created!');

    // 6. Create child and make parent admin
    console.log('\n6. Creating sample child...');
    const childResult = await sql`
      INSERT INTO children (name, birth_date, created_by) 
      VALUES ('Emma', '2012-05-15', ${parentId}) 
      RETURNING *
    `;
    const childId = childResult[0].id;

    // Update parent to admin role
    await sql`
      UPDATE users 
      SET role = 'admin', child_id = ${childId} 
      WHERE id = ${parentId}
    `;

    // Grant full permissions to parent
    await sql`
      INSERT INTO user_permissions (user_id, child_id, can_read, can_write, can_read_sensitive, granted_by)
      VALUES (${parentId}, ${childId}, true, true, true, ${parentId})
      ON CONFLICT (user_id, child_id) DO UPDATE SET
        can_read = true, can_write = true, can_read_sensitive = true
    `;
    console.log('✅ Child created and parent promoted to admin!');

    // 7. Update existing log entries to reference the child
    console.log('\n7. Updating existing log entries...');
    await sql`UPDATE log_entries SET child_id = ${childId} WHERE child_id IS NULL`;
    console.log('✅ Log entries updated with child reference!');

    // 8. Display current users
    console.log('\n📊 Current Users:');
    const users = await sql`
      SELECT 
        u.id, u.name, u.email, u.role, 
        c.name as child_name, u.is_active
      FROM users u
      LEFT JOIN children c ON u.child_id = c.id
      ORDER BY u.created_at
    `;
    
    console.table(users);

    console.log('\n🎉 Role system setup completed successfully!');
    console.log('💡 Test accounts:');
    console.log('   - superadmin@idavang.dk (Super Admin)');
    console.log('   - foraelder@idavang.dk (Admin for Emma)');
    console.log('   - laerer@skole.dk (Teacher - needs permissions)');
    
  } catch (error) {
    console.error('❌ Error setting up role system:', error);
    process.exit(1);
  }
}

// Run the setup
setupRoleSystem();
