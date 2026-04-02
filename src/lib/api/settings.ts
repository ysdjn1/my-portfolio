import { SiteSettings } from '@/lib/types';
import { sql } from '@vercel/postgres';

export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        const { rows } = await sql`SELECT * FROM site_settings WHERE id = 1 LIMIT 1;`;
        if (rows.length === 0) return null;
        
        const row = rows[0];
        return {
            id: row.id,
            title: row.title || '',
            description: row.description || '',
            tiktokUrl: row.tiktok_url || '',
            twitterUrl: row.twitter_url || '',
            btcAddress: row.btc_address || '',
            ethAddress: row.eth_address || '',
            solAddress: row.sol_address || '',
        };
    } catch (error) {
        console.error('Failed to fetch site settings:', error);
        return null;
    }
}
