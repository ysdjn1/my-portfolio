import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
    try {
        const { fileId, publicUrl, externalUrl } = await request.json();

        if (!fileId || !publicUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Add to Postgres database
        // As per the requirement, we use the original video URL for preview and thumbnail as well.
        await sql`
            INSERT INTO works (id, title, thumbnail_url, preview_url, original_video_url, platform, aspect_ratio, external_url)
            VALUES (${fileId}, 'New Upload', ${publicUrl}, ${publicUrl}, ${publicUrl}, 'tiktok', 0.5625, ${externalUrl || null})
        `;

        revalidatePath('/');
        revalidatePath('/admin/upload');

        return NextResponse.json({ success: true, id: fileId });

    } catch (error) {
        console.error('Upload complete error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
