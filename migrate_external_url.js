const { sql } = require('@vercel/postgres');

async function main() {
  try {
    const res = await sql`ALTER TABLE works ADD COLUMN external_url VARCHAR(2048);`;
    console.log('Successfully added external_url column:', res);
  } catch (err) {
    if (err.message && err.message.includes('already exists')) {
        console.log('Column already exists!');
    } else {
        console.error('Failed:', err);
    }
  }
}

main();
