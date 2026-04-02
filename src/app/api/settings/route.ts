import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSiteSettings } from '@/lib/api/settings';

export async function GET() {
    try {
        const settings = await getSiteSettings();
        if (!settings) {
            return NextResponse.json({ message: 'Settings not found' }, { status: 404 });
        }
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { title, description, tiktokUrl, twitterUrl, btcAddress, ethAddress, solAddress } = body;

        await sql`
            UPDATE site_settings
            SET 
                title = ${title},
                description = ${description},
                tiktok_url = ${tiktokUrl},
                twitter_url = ${twitterUrl},
                btc_address = ${btcAddress},
                eth_address = ${ethAddress},
                sol_address = ${solAddress}
            WHERE id = 1
        `;

        return NextResponse.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ message: 'Failed to update settings' }, { status: 500 });
    }
}
