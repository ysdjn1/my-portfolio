import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getWorkById } from '@/lib/api/works';
import { sql } from '@vercel/postgres';
import { deleteFromR2 } from '@/lib/s3';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // In Next.js 15, route params are technically a Promise or accessible directly, here assuming we use await properly or standard destructuring according to Next 14/15 rules. In Next 15 `params` is a promise.
) {
    try {
        const { id } = await context.params;
        const work = await getWorkById(id);
        
        if (!work) {
            return NextResponse.json({ error: 'Work not found' }, { status: 404 });
        }

        return NextResponse.json(work);
    } catch (error) {
         return NextResponse.json(
            { error: 'Failed to fetch work' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        // 1. Get the work entry to find the R2 URLs
        const { rows } = await sql`
            SELECT original_video_url, thumbnail_url, preview_url 
            FROM works 
            WHERE id = ${id}
        `;

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Work not found' }, { status: 404 });
        }

        const work = rows[0];

        // 2. Delete files from Cloudflare R2
        console.log(`Attempting to delete files for work ID: ${id}`);
        
        const deletePromises = [];
        if (work.original_video_url) deletePromises.push(deleteFromR2(work.original_video_url));
        if (work.thumbnail_url) deletePromises.push(deleteFromR2(work.thumbnail_url));
        if (work.preview_url) deletePromises.push(deleteFromR2(work.preview_url));

        // Wait for all deletions to finish (in parallel)
        await Promise.all(deletePromises);

        // 3. Delete the record from Postgres
        await sql`
            DELETE FROM works 
            WHERE id = ${id}
        `;
        
        console.log(`Successfully deleted work ID: ${id} from DB and R2.`);

        // Force cache invalidation to instantly update the UI in production
        revalidatePath('/');
        revalidatePath('/admin/upload');

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting work:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
