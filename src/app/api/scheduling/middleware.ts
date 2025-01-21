import { NextResponse } from 'next/server';
import { validateShiftRules } from '@/lib/scheduling/collision';

export async function validateShiftMiddleware(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.startTime || !body.endTime || !body.type) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Validate against business rules
    const validation = await validateShiftRules(body, body.assignedStaff || []);
    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({ error: 'Shift validation failed', violations: validation.violations }),
        { status: 400 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Validation error' }),
      { status: 500 }
    );
  }
}
