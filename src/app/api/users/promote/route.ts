import { NextRequest, NextResponse } from 'next/server';
import { promoteToAdmin } from '../../../../lib/user-roles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { granterId, userId, childId } = body;
    
    if (!granterId || !userId || !childId) {
      return NextResponse.json(
        { success: false, error: 'Manglende påkrævede felter' },
        { status: 400 }
      );
    }
    
    const result = await promoteToAdmin(granterId, userId, childId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bruger forfremmet til administrator'
    });
  } catch (error) {
    console.error('Error in POST /api/users/promote:', error);
    return NextResponse.json(
      { success: false, error: 'Intern serverfejl' },
      { status: 500 }
    );
  }
}
