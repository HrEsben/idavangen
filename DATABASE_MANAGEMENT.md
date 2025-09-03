# Neon Database Management Guide

## Database Access Methods

### 1. Through Your Next.js App (Recommended for Development)

Your app is already set up to interact with the database. Test it locally:

```bash
# Your dev server should already be running
# Visit http://localhost:3000
# Use the User Management interface to add/view users
```

### 2. Neon Web Console

1. **Go to [Neon Console](https://console.neon.tech/)**
2. **Login with your account**
3. **Select your project**: `withered-butterfly-37678585`
4. **Use the SQL Editor** to run queries directly

### 3. Command Line with psql

Install PostgreSQL client tools:

```bash
# macOS
brew install postgresql

# Then connect to your database
psql "postgresql://neondb_owner:npg_qeI15QOEZtAC@ep-lingering-credit-agg2oiu7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### 4. GUI Database Tools

#### Option A: pgAdmin
1. Download [pgAdmin](https://www.pgadmin.org/)
2. Create new server connection:
   - **Host**: `ep-lingering-credit-agg2oiu7-pooler.c-2.eu-central-1.aws.neon.tech`
   - **Port**: `5432`
   - **Database**: `neondb`
   - **Username**: `neondb_owner`
   - **Password**: `npg_qeI15QOEZtAC`
   - **SSL Mode**: `Require`

#### Option B: TablePlus (macOS)
1. Download [TablePlus](https://tableplus.com/)
2. Create PostgreSQL connection with above credentials

#### Option C: DBeaver (Free)
1. Download [DBeaver](https://dbeaver.io/)
2. Create PostgreSQL connection with above credentials

### 5. Direct API Testing

Test your API endpoints locally:

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## Common Database Operations

### Create the Users Table Manually

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Query Examples

```sql
-- View all users
SELECT * FROM users ORDER BY created_at DESC;

-- Add a user
INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com');

-- Update a user
UPDATE users SET name = 'Jane Doe' WHERE email = 'jane@example.com';

-- Delete a user
DELETE FROM users WHERE email = 'jane@example.com';

-- Count total users
SELECT COUNT(*) FROM users;

-- Find users by name pattern
SELECT * FROM users WHERE name ILIKE '%john%';
```

### Table Structure Queries

```sql
-- Show table structure
\d users

-- Show all tables
\dt

-- Show database info
\l

-- Show current database size
SELECT pg_size_pretty(pg_database_size('neondb'));
```

## Neon-Specific Features

### 1. Database Branching

Create database branches (like Git branches):

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Create a new branch
neonctl branches create --name feature-branch

# List branches
neonctl branches list

# Switch to branch
neonctl branches get feature-branch
```

### 2. Connection Pooling

You have two connection strings:
- **Pooled** (recommended for apps): Uses connection pooling
- **Unpooled** (for admin tasks): Direct connection

### 3. Monitoring

In Neon Console, you can monitor:
- Database size and usage
- Query performance
- Connection metrics
- Billing information

## Development Workflow

### 1. Local Development
```bash
# Use your local dev server
npm run dev

# Database operations go through your API routes
# Visit http://localhost:3000 to test
```

### 2. Database Schema Changes
```bash
# Create migration scripts
# Run them via Neon Console or psql
# Test locally first
```

### 3. Production Deployment
```bash
# Push changes to GitHub
git push origin main

# Vercel automatically redeploys
# Database schema changes need manual execution
```

## Backup and Restore

### Export Data
```bash
# Export all data
pg_dump "postgresql://neondb_owner:npg_qeI15QOEZtAC@ep-lingering-credit-agg2oiu7-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require" > backup.sql

# Export specific table
pg_dump -t users "postgresql://..." > users_backup.sql
```

### Import Data
```bash
# Import from backup
psql "postgresql://..." < backup.sql
```

## Security Best Practices

1. **Never commit credentials** to Git (already handled in .gitignore)
2. **Use environment variables** for all database connections
3. **Rotate passwords** periodically in Neon Console
4. **Use pooled connections** for application code
5. **Monitor access logs** in Neon Console

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql "postgresql://..." -c "SELECT 1;"

# Check if database exists
psql "postgresql://..." -c "\l"
```

### Performance Issues
- Use Neon Console monitoring
- Check slow query logs
- Consider indexing for frequently queried columns

### Local Development Issues
```bash
# Restart dev server
npm run dev

# Check environment variables
echo $DATABASE_URL
```

Start with the Next.js app interface at http://localhost:3000 to test basic functionality, then explore the other methods as needed!
