import { NextRequest, NextResponse } from 'next/server';
import { grantPermissions } from '../../../../lib/user-roles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { granterId, userId, childId, permissions } = body;
    
    if (!granterId || !userId || !childId || !permissions) {
      return NextResponse.json(
        { success: false, error: 'Manglende påkrævede felter' },
        { status: 400 }
      );
    }
    
    const result = await grantPermissions(granterId, userId, childId, permissions);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tilladelser tildelt succesfuldt'
    });
  } catch (error) {
    console.error('Error in POST /api/users/permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Intern serverfejl' },
      { status: 500 }
    );
  }
}
