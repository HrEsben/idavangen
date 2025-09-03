import { NextRequest, NextResponse } from 'next/server';
import { getChildren } from '../../../lib/user-roles';

export async function GET() {
  try {
    const result = await getChildren();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error in GET /api/children:', error);
    return NextResponse.json(
      { success: false, error: 'Intern serverfejl' },
      { status: 500 }
    );
  }
}
