import { GridItem, WorkItem, AdItem } from '@/lib/types';
import { sql } from '@vercel/postgres';

export async function getWorks(includePrivate = false): Promise<GridItem[]> {
    try {
        const { rows } = includePrivate 
            ? await sql`SELECT * FROM works ORDER BY created_at DESC`
            : await sql`SELECT * FROM works WHERE (is_public = TRUE OR is_public IS NULL) AND original_video_url IS NOT NULL AND original_video_url != '' ORDER BY created_at DESC`;
        
        return rows.map(row => {
            const base = {
                id: row.id,
                title: row.title,
                thumbnailUrl: row.thumbnail_url,
                aspectRatio: row.aspect_ratio,
                isPublic: row.is_public ?? true,
                description: row.description,
                previewUrl: row.preview_url,
                originalVideoUrl: row.original_video_url,
                originalUrl: row.original_url,
                platform: row.platform,
                externalUrl: row.external_url,
            };

            if (row.type === 'ad') {
                return {
                    ...base,
                    type: 'ad',
                } as AdItem;
            }

            return {
                ...base,
                type: 'work',
            } as WorkItem;
        });
    } catch (error) {
        console.error('Failed to fetch works from DB:', error);
        return [];
    }
}

export async function getWorkById(id: string): Promise<GridItem | null> {
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
            type: row.type === 'ad' ? 'ad' : 'work',
            title: row.title,
            description: row.description,
            thumbnailUrl: row.thumbnail_url,
            previewUrl: row.preview_url,
            originalVideoUrl: row.original_video_url,
            originalUrl: row.original_url,
            platform: row.platform,
            aspectRatio: row.aspect_ratio,
            isPublic: row.is_public ?? true,
            externalUrl: row.external_url,
        } as WorkItem | AdItem;
    } catch (error) {
        console.error('Failed to fetch work by ID:', error);
        return null;
    }
}
