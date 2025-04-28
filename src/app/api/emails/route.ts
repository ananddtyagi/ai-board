import { saveEmail } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Endpoint to save an email to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email} = body;

    // Validate the email
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 });
    }
    
    // Save the email
    const result = await saveEmail(email);

    if (result.success) {
      return NextResponse.json({
        success: true
      }, { status: 200 });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Error saving email:', error);
    return NextResponse.json({
      error: 'Failed to save email'
    }, { status: 500 });
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}