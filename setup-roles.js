import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

// Import functions directly using dynamic import
const { createRolesTables, createUserWithRole, createChild } = await import('./src/lib/user-roles.js');

async function setupRoleSystem() {
  console.log('🔧 Setting up user role system...\n');

  try {
    // 1. Create role system tables
    console.log('1. Creating role system tables...');
    const tablesResult = await createRolesTables();
    if (!tablesResult.success) {
      throw new Error(`Failed to create tables: ${tablesResult.error}`);
    }
    console.log('✅ Role system tables created successfully!');

    // 2. Create a super admin user
    console.log('\n2. Creating super admin user...');
    const superAdminResult = await createUserWithRole(
      'Super Administrator', 
      'superadmin@idavang.dk', 
      'parent'
    );
    if (!superAdminResult.success) {
      throw new Error(`Failed to create super admin: ${superAdminResult.error}`);
    }
    
    // Manually set super_admin role (since createUserWithRole doesn't support super_admin)
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    await sql`UPDATE users SET role = 'super_admin' WHERE email = 'superadmin@idavang.dk'`;
    console.log('✅ Super admin created successfully!');

    // 3. Create sample parent user
    console.log('\n3. Creating sample parent user...');
    const parentResult = await createUserWithRole(
      'Mor/Far', 
      'foraelder@idavang.dk', 
      'parent'
    );
    if (!parentResult.success) {
      throw new Error(`Failed to create parent: ${parentResult.error}`);
    }
    console.log('✅ Parent user created successfully!');

    // 4. Create sample child and make parent admin
    console.log('\n4. Creating sample child...');
    const childResult = await createChild(
      'Emma', 
      '2012-05-15', 
      parentResult.data.id
    );
    if (!childResult.success) {
      throw new Error(`Failed to create child: ${childResult.error}`);
    }
    console.log('✅ Child created and parent promoted to admin!');

    // 5. Create sample teacher user
    console.log('\n5. Creating sample teacher user...');
    const teacherResult = await createUserWithRole(
      'Lærer Hansen', 
      'laerer@skole.dk', 
      'teacher'
    );
    if (!teacherResult.success) {
      throw new Error(`Failed to create teacher: ${teacherResult.error}`);
    }
    console.log('✅ Teacher user created successfully!');

    // 6. Update existing log entries to reference the child
    console.log('\n6. Updating existing log entries...');
    await sql`UPDATE log_entries SET child_id = ${childResult.data.id} WHERE child_id IS NULL`;
    console.log('✅ Log entries updated with child reference!');

    // 7. Display role system overview
    console.log('\n📊 Role System Overview:');
    console.log('┌─────────────────┬─────────────────────┬────────────────┬─────────────────┐');
    console.log('│ Role            │ Description         │ Access Level   │ Special Rights  │');
    console.log('├─────────────────┼─────────────────────┼────────────────┼─────────────────┤');
    console.log('│ Super Admin     │ System oversight    │ All children   │ No sensitive    │');
    console.log('│ Admin           │ Child\'s primary     │ Own child      │ Full access     │');
    console.log('│ Parent          │ Family member       │ As granted     │ Can be promoted │');
    console.log('│ Teacher         │ School staff        │ As granted     │ Educational     │');
    console.log('└─────────────────┴─────────────────────┴────────────────┴─────────────────┘');

    console.log('\n🎉 Role system setup completed successfully!');
    console.log('💡 Next steps:');
    console.log('   - Log in as foraelder@idavang.dk (Admin for Emma)');
    console.log('   - Grant permissions to laerer@skole.dk');
    console.log('   - Test different access levels');
    
  } catch (error) {
    console.error('❌ Error setting up role system:', error);
    process.exit(1);
  }
}

// Run the setup
setupRoleSystem();
