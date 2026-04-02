import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
    try {
        const { fileId, publicUrl, externalUrl, type, title, description, platform, originalUrl } = await request.json();

        if (!fileId || !publicUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const dbType = type || 'work';
        const dbTitle = title || 'New Upload';

        // Add to Postgres database
        // As per the requirement, we use the original video URL for preview and thumbnail as well.
        await sql`
            INSERT INTO works (id, title, thumbnail_url, preview_url, original_video_url, platform, aspect_ratio, external_url, description, original_url, type)
            VALUES (${fileId}, ${dbTitle}, ${publicUrl}, ${publicUrl}, ${publicUrl}, ${platform || null}, 0.5625, ${externalUrl || null}, ${description || null}, ${originalUrl || null}, ${dbType})
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
