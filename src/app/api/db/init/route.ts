import { initializeDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

// This endpoint initializes the database schema
export async function GET() {
  try {
    const result = await initializeDatabase();
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Database initialized successfully' 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        error: 'Failed to initialize database'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}