import { NextRequest, NextResponse } from 'next/server';
import { getUsersWithRoles } from '../../../../lib/user-roles';

export async function GET() {
  try {
    const result = await getUsersWithRoles();
    
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
    console.error('Error in GET /api/users/roles:', error);
    return NextResponse.json(
      { success: false, error: 'Intern serverfejl' },
      { status: 500 }
    );
  }
}
