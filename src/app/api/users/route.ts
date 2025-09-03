import { NextRequest, NextResponse } from 'next/server';
import { createUsersTable, getUsers, createUser } from '@/lib/db';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Please add Neon database integration in Vercel.' },
        { status: 503 }
      );
    }
    
    // Ensure the users table exists
    await createUsersTable();
    
    // Get all users
    const result = await getUsers();
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Please add Neon database integration in Vercel.' },
        { status: 503 }
      );
    }
    
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Ensure the users table exists
    await createUsersTable();
    
    // Create new user
    const result = await createUser(name, email);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
