import { NextRequest, NextResponse } from 'next/server';
import { createLogEntriesTable, createLogEntry, getLogEntries } from '@/lib/logging-db';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database ikke konfigureret. Tilføj venligst Neon database integration i Vercel.' },
        { status: 503 }
      );
    }
    
    // Ensure the log_entries table exists
    await createLogEntriesTable();
    
    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      category: searchParams.get('category'),
      logged_by: searchParams.get('logged_by'),
    };
    
    // Remove null values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === null) {
        delete filters[key as keyof typeof filters];
      }
    });
    
    // Get log entries
    const result = await getLogEntries(filters);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kunne ikke hente logindtastninger' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Intern server fejl' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database ikke konfigureret. Tilføj venligst Neon database integration i Vercel.' },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.category || !body.date) {
      return NextResponse.json(
        { error: 'Titel, kategori og dato er påkrævede felter' },
        { status: 400 }
      );
    }
    
    // Ensure the log_entries table exists
    await createLogEntriesTable();
    
    // Prepare log entry data
    const logEntry = {
      date: body.date,
      category: body.category,
      mood_level: body.mood_level || null,
      energy_level: body.energy_level || null,
      school_attendance: body.school_attendance || null,
      school_hours: body.school_hours || null,
      school_activity: body.school_activity || null,
      school_challenges: body.school_challenges || null,
      school_successes: body.school_successes || null,
      anxiety_level: body.anxiety_level || null,
      social_interaction_quality: body.social_interaction_quality || null,
      focus_ability: body.focus_ability || null,
      title: body.title,
      description: body.description || null,
      notes: body.notes || null,
      logged_by: body.logged_by || 'Bruger',
      tags: body.tags || [],
      triggers: body.triggers || null,
      interventions_used: body.interventions_used || null,
      effectiveness_rating: body.effectiveness_rating || null,
    };
    
    // Create log entry
    const result = await createLogEntry(logEntry);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kunne ikke oprette logindtastning' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Intern server fejl' },
      { status: 500 }
    );
  }
}
