import { GridItem, WorkItem } from '@/lib/types';
import { sql } from '@vercel/postgres';

export async function getWorks(): Promise<GridItem[]> {
    try {
        const { rows } = await sql`
            SELECT * FROM works
            ORDER BY created_at DESC
        `;
        
        return rows.map(row => ({
            id: row.id,
            type: 'work',
            title: row.title,
            thumbnailUrl: row.thumbnail_url,
            previewUrl: row.preview_url,
            originalVideoUrl: row.original_video_url,
            platform: row.platform,
            aspectRatio: row.aspect_ratio,
        } as WorkItem));
    } catch (error) {
        console.error('Failed to fetch works from DB:', error);
        return [];
    }
}

export async function getWorkById(id: string): Promise<WorkItem | null> {
    try {
        const { rows } = await sql`
            SELECT * FROM works
            WHERE id = ${id}
            LIMIT 1
        `;

        if (rows.length === 0) return null;
        
        const row = rows[0];
        return {
            id: row.id,
            type: 'work',
            title: row.title,
            thumbnailUrl: row.thumbnail_url,
            previewUrl: row.preview_url,
            originalVideoUrl: row.original_video_url,
            platform: row.platform,
            aspectRatio: row.aspect_ratio,
        } as WorkItem;
    } catch (error) {
        console.error('Failed to fetch work by ID:', error);
        return null;
    }
}
