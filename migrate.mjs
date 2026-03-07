import { sql } from '@vercel/postgres';

process.env.POSTGRES_URL = "postgresql://neondb_owner:npg_NV5CqRlJBh6S@ep-holy-shape-a1cp259u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  try {
    const res = await sql`ALTER TABLE works ADD COLUMN is_public BOOLEAN DEFAULT TRUE;`;
    console.log('Successfully added is_public column:', res);
  } catch (err) {
    if (err.message.includes('already exists')) {
        console.log('Column already exists!');
    } else {
        console.error('Failed:', err);
    }
  }
}

main();
