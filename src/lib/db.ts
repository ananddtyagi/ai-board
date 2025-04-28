import { sql } from '@vercel/postgres';

// Function to create the emails table if it doesn't exist
export async function initializeDatabase() {
  try {
    // Create a simple emails table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(255)
      );
    `;
    
    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return { success: false, error };
  }
}

// Function to save an email to the database
export async function saveEmail(email: string) {
  try {
    const result = await sql`
      INSERT INTO emails (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Failed to save email:', error);
    return { success: false, error };
  }
}

// Function to check if an email already exists
export async function checkEmailExists(email: string) {
  try {
    const result = await sql`
      SELECT * FROM emails WHERE email = ${email};
    `;
    
    return { 
      success: true, 
      exists: result.rowCount > 0
    };
  } catch (error) {
    console.error('Failed to check email:', error);
    return { success: false, error };
  }
}