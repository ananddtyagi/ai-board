import { NextRequest, NextResponse } from 'next/server';
import { generateBoardResponses } from '../openai';

export async function POST(request: NextRequest) {
  try {
    const { query, personas } = await request.json();

    if (!query || !personas || !Array.isArray(personas)) {
      return NextResponse.json(
        { error: 'Invalid request body. Requires query and personas array.' },
        { status: 400 }
      );
    }

    // Generate responses from all personas
    const responses = await generateBoardResponses(query, personas);

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error in board API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate board responses' },
      { status: 500 }
    );
  }
}