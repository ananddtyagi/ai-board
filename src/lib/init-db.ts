// This file contains the initialization script for the database
// It will be run once when the app starts

let initialized = false;

// Function to initialize the database during app startup
export async function initDatabase() {
  // Only run initialization once
  if (initialized) return;

  // In production, call our API endpoint to initialize the database
  if (process.env.NODE_ENV === 'production') {
    try {
      const endpoint = `https://${process.env.VERCEL_URL}/api/db/init`
        
      const response = await fetch(endpoint);
      const data = await response.json();
      
      console.log('Database initialization response:', data);
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

// Run the initialization when the module is imported
initDatabase();