import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const client = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const { query, personas } = await request.json();

    if (!query || !personas || !Array.isArray(personas)) {
      return NextResponse.json(
        { error: 'Invalid request body. Requires query and personas array.' },
        { status: 400 }
      );
    }

    // Create a list of persona names for the router to choose from
    const personaNames = personas.map(p => p.name).join(', ');
    
    // Define the routing prompt
    const routerPrompt = `
You are a query router for an AI advisory board with multiple personas.
Given a user's question, determine which board member(s) would be most appropriate to answer.

Available board members: ${personaNames}

IMPORTANT: Respond ONLY with the names of the board members who should answer, separated by commas.
Do not include any explanations or additional text - just the names.

For example:
- For a question about product innovation, you might respond: "Steve Jobs"
- For a question about both investing and technology, you might respond: "Warren Buffett, Elon Musk"

User question: ${query}

Appropriate board members:`;

    // Get router's decision on which personas should respond
    const response = await client.responses.create({
      model: "gpt-4o",
      input: routerPrompt,
    });

    // Extract the persona names from the response
    const selectedPersonaNames = response.output_text.split(',').map(name => name.trim());
    
    return NextResponse.json({ selectedPersonaNames });
  } catch (error) {
    console.error('Error in router API route:', error);
    return NextResponse.json(
      { error: 'Failed to route the query' },
      { status: 500 }
    );
  }
}