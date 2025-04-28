import OpenAI from 'openai';

// Initialize the OpenAI client
const client = new OpenAI();

export interface PersonaPrompt {
  personaId: string;
  systemPrompt: string;
  query: string;
}

/**
 * Generate a response from a specific persona using OpenAI API
 */
export async function generatePersonaResponse({
  personaId,
  systemPrompt,
  query
}: PersonaPrompt): Promise<string> {
  try {
    const response = await client.responses.create({
      model: "gpt-4o", // Using the model from the quickstart guide
      instructions: systemPrompt,
      input: query,
    });

    return response.output_text;
  } catch (error) {
    console.error(`Error generating response for persona ${personaId}:`, error);
    throw error;
  }
}

/**
 * Generate responses from multiple personas in parallel
 */
export async function generateBoardResponses(
  query: string,
  personas: Array<{ id: string; systemPrompt: string }>
): Promise<Array<{ personaId: string; response: string }>> {
  try {
    const responsePromises = personas.map(persona => 
      generatePersonaResponse({
        personaId: persona.id,
        systemPrompt: persona.systemPrompt,
        query
      }).then(response => ({
        personaId: persona.id,
        response
      }))
    );

    return await Promise.all(responsePromises);
  } catch (error) {
    console.error('Error generating board responses:', error);
    throw error;
  }
}