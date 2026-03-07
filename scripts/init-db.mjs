import { sql } from '@vercel/postgres';

async function initDB() {
  console.log('Initializing database...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS works (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(1024) NOT NULL,
        preview_url VARCHAR(1024),
        original_video_url VARCHAR(1024),
        platform VARCHAR(50),
        aspect_ratio REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Successfully created works table!');
  } catch (error) {
    console.error('Error creating works table:', error);
  }
}

initDB();
