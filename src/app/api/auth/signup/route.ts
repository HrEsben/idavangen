import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { name, email, role } = await request.json();

    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Alle felter er påkrævet' },
        { status: 400 }
      );
    }

    if (!['parent', 'teacher'].includes(role)) {
      return NextResponse.json(
        { error: 'Ugyldig rolle' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'En bruger med denne email eksisterer allerede' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await sql`
      INSERT INTO users (name, email, role, is_active)
      VALUES (${name}, ${email}, ${role}, true)
      RETURNING id, name, email, role
    `;

    return NextResponse.json(
      { 
        message: 'Bruger oprettet successfully',
        user: newUser[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Der opstod en teknisk fejl. Prøv igen senere.' },
      { status: 500 }
    );
  }
}
