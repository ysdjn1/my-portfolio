import { sql } from '@vercel/postgres';

process.env.POSTGRES_URL = "postgresql://neondb_owner:npg_NV5CqRlJBh6S@ep-frosty-mud-a1syy5y6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  try {
    // 1. Add description
    try {
        await sql`ALTER TABLE works ADD COLUMN description TEXT;`;
        console.log('Added column description');
    } catch (e) {
        if (e.message.includes('already exists')) console.log('Column description already exists.');
        else throw e;
    }

    // 2. Add original_url
    try {
        await sql`ALTER TABLE works ADD COLUMN original_url VARCHAR(1024);`;
        console.log('Added column original_url');
    } catch (e) {
        if (e.message.includes('already exists')) console.log('Column original_url already exists.');
        else throw e;
    }

    // 3. Add type with default 'work'
    try {
        await sql`ALTER TABLE works ADD COLUMN type VARCHAR(50) DEFAULT 'work';`;
        console.log('Added column type with default "work"');
    } catch (e) {
        if (e.message.includes('already exists')) console.log('Column type already exists.');
        else throw e;
    }

    console.log('Migration completed successfully.');

  } catch (err) {
    console.error('Failed migration:', err);
  }
}

main();
