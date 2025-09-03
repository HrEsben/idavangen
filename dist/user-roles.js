import { neon } from '@neondatabase/serverless';
// Use a dummy URL for build time if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const sql = neon(databaseUrl);
// Create tables for the role system
export async function createRolesTables() {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        // Create children table
        await sql `
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        birth_date DATE,
        created_by INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `;
        // Update users table to include roles
        await sql `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'parent',
      ADD COLUMN IF NOT EXISTS child_id INTEGER,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD FOREIGN KEY (child_id) REFERENCES children(id);
    `;
        // Create user permissions table
        await sql `
      CREATE TABLE IF NOT EXISTS user_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        child_id INTEGER NOT NULL,
        can_read BOOLEAN DEFAULT true,
        can_write BOOLEAN DEFAULT false,
        can_read_sensitive BOOLEAN DEFAULT false,
        granted_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (child_id) REFERENCES children(id),
        FOREIGN KEY (granted_by) REFERENCES users(id),
        UNIQUE(user_id, child_id)
      );
    `;
        // Update log_entries table to reference child
        await sql `
      ALTER TABLE log_entries 
      ADD COLUMN IF NOT EXISTS child_id INTEGER,
      ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT false,
      ADD FOREIGN KEY (child_id) REFERENCES children(id);
    `;
        return { success: true };
    }
    catch (error) {
        console.error('Error creating roles tables:', error);
        return { success: false, error };
    }
}
// Create a child and set the creator as admin
export async function createChild(name, birthDate, createdBy) {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        // Create child
        const childResult = await sql `
      INSERT INTO children (name, birth_date, created_by) 
      VALUES (${name}, ${birthDate}, ${createdBy}) 
      RETURNING *
    `;
        const child = childResult[0];
        // Update creator to admin role and link to child
        await sql `
      UPDATE users 
      SET role = 'admin', child_id = ${child.id} 
      WHERE id = ${createdBy}
    `;
        // Grant full permissions to creator
        await sql `
      INSERT INTO user_permissions (user_id, child_id, can_read, can_write, can_read_sensitive, granted_by)
      VALUES (${createdBy}, ${child.id}, true, true, true, ${createdBy})
    `;
        return { success: true, data: child };
    }
    catch (error) {
        console.error('Error creating child:', error);
        return { success: false, error };
    }
}
// Create user with specific role
export async function createUserWithRole(name, email, role = 'parent', childId) {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        const result = await sql `
      INSERT INTO users (name, email, role, child_id) 
      VALUES (${name}, ${email}, ${role}, ${childId || null}) 
      RETURNING *
    `;
        return { success: true, data: result[0] };
    }
    catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error };
    }
}
// Grant permissions to a user for a child
export async function grantPermissions(granterId, userId, childId, permissions) {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        // Check if granter has admin rights for this child
        const granterCheck = await sql `
      SELECT role, child_id FROM users WHERE id = ${granterId}
    `;
        if (granterCheck.length === 0 ||
            (granterCheck[0].role !== 'admin' && granterCheck[0].role !== 'super_admin') ||
            (granterCheck[0].role === 'admin' && granterCheck[0].child_id !== childId)) {
            return { success: false, error: 'Insufficient permissions to grant access' };
        }
        await sql `
      INSERT INTO user_permissions (user_id, child_id, can_read, can_write, can_read_sensitive, granted_by)
      VALUES (${userId}, ${childId}, ${permissions.canRead || false}, ${permissions.canWrite || false}, ${permissions.canReadSensitive || false}, ${granterId})
      ON CONFLICT (user_id, child_id) 
      DO UPDATE SET 
        can_read = ${permissions.canRead || false},
        can_write = ${permissions.canWrite || false},
        can_read_sensitive = ${permissions.canReadSensitive || false},
        granted_by = ${granterId}
    `;
        return { success: true };
    }
    catch (error) {
        console.error('Error granting permissions:', error);
        return { success: false, error };
    }
}
// Promote user to admin role
export async function promoteToAdmin(granterId, userId, childId) {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        // Check if granter has admin rights
        const granterCheck = await sql `
      SELECT role, child_id FROM users WHERE id = ${granterId}
    `;
        if (granterCheck.length === 0 ||
            (granterCheck[0].role !== 'admin' && granterCheck[0].role !== 'super_admin') ||
            (granterCheck[0].role === 'admin' && granterCheck[0].child_id !== childId)) {
            return { success: false, error: 'Insufficient permissions to promote user' };
        }
        await sql `
      UPDATE users 
      SET role = 'admin', child_id = ${childId}
      WHERE id = ${userId}
    `;
        // Grant full permissions
        await sql `
      INSERT INTO user_permissions (user_id, child_id, can_read, can_write, can_read_sensitive, granted_by)
      VALUES (${userId}, ${childId}, true, true, true, ${granterId})
      ON CONFLICT (user_id, child_id) 
      DO UPDATE SET 
        can_read = true,
        can_write = true,
        can_read_sensitive = true,
        granted_by = ${granterId}
    `;
        return { success: true };
    }
    catch (error) {
        console.error('Error promoting user:', error);
        return { success: false, error };
    }
}
// Get user permissions for a child
export async function getUserPermissions(userId, childId) {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        // Check user role first
        const userResult = await sql `
      SELECT role, child_id FROM users WHERE id = ${userId}
    `;
        if (userResult.length === 0) {
            return { success: false, error: 'User not found' };
        }
        const user = userResult[0];
        // Super admin can see everything except sensitive info
        if (user.role === 'super_admin') {
            return {
                success: true,
                data: {
                    canRead: true,
                    canWrite: true,
                    canReadSensitive: false
                }
            };
        }
        // Admin for this child has full access
        if (user.role === 'admin' && user.child_id === childId) {
            return {
                success: true,
                data: {
                    canRead: true,
                    canWrite: true,
                    canReadSensitive: true
                }
            };
        }
        // Check specific permissions
        const permResult = await sql `
      SELECT can_read, can_write, can_read_sensitive 
      FROM user_permissions 
      WHERE user_id = ${userId} AND child_id = ${childId}
    `;
        if (permResult.length === 0) {
            return {
                success: true,
                data: {
                    canRead: false,
                    canWrite: false,
                    canReadSensitive: false
                }
            };
        }
        return { success: true, data: permResult[0] };
    }
    catch (error) {
        console.error('Error getting user permissions:', error);
        return { success: false, error };
    }
}
// Get all users with their roles and permissions
export async function getUsersWithRoles() {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        const result = await sql `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.child_id,
        u.is_active,
        u.created_at,
        c.name as child_name
      FROM users u
      LEFT JOIN children c ON u.child_id = c.id
      ORDER BY u.created_at DESC
    `;
        return { success: true, data: result };
    }
    catch (error) {
        console.error('Error fetching users with roles:', error);
        return { success: false, error };
    }
}
// Get all children
export async function getChildren() {
    if (!process.env.DATABASE_URL) {
        return { success: false, error: 'No database connection configured' };
    }
    try {
        const result = await sql `
      SELECT 
        c.*,
        u.name as created_by_name
      FROM children c
      JOIN users u ON c.created_by = u.id
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
    `;
        return { success: true, data: result };
    }
    catch (error) {
        console.error('Error fetching children:', error);
        return { success: false, error };
    }
}
