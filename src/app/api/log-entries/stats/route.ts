import { NextRequest, NextResponse } from 'next/server';
import { getLogEntriesStats } from '@/lib/logging-db';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database ikke konfigureret' },
        { status: 503 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    const result = await getLogEntriesStats(days);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Kunne ikke hente statistikker' },
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
