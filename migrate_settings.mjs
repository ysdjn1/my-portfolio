import { sql } from '@vercel/postgres';

async function main() {
  try {
    console.log('Creating site_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        tiktok_url VARCHAR(1024),
        twitter_url VARCHAR(1024),
        btc_address VARCHAR(255),
        eth_address VARCHAR(255),
        sol_address VARCHAR(255)
      );
    `;
    console.log('Created site_settings table.');

    console.log('Inserting default settings...');
    await sql`
      INSERT INTO site_settings (id, title, description, tiktok_url, twitter_url, btc_address, eth_address, sol_address)
      VALUES (
        1, 
        'A secret collection of cute girls', 
        'A collection of short video content spanning TikTok, Instagram, and other platforms.', 
        '', '', '', '', ''
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('Default settings inserted (if not already present).');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Failed migration:', err);
  }
}

main();
