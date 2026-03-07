const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

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
