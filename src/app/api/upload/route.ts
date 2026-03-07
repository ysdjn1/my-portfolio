import { NextRequest, NextResponse } from 'next/server';
import { processVideo } from '@/lib/ffmpeg';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { uploadToR2 } from '@/lib/s3';
import { sql } from '@vercel/postgres';
import { WorkItem } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileId = crypto.randomUUID(); // Use native crypto
        const originalFilename = `${fileId}${path.extname(file.name)}`;
        
        // 1. Upload original video directly to R2
        console.log('Uploading original to R2...', originalFilename);
        const r2OriginalUrl = await uploadToR2(buffer, `originals/${originalFilename}`, file.type || 'video/mp4');

        // 2. We still need a local file for ffmpeg to process.
        // Save to a temporary directory.
        const tmpDir = path.join(process.cwd(), '.temp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const tempFilePath = path.join(tmpDir, originalFilename);
        await writeFile(tempFilePath, buffer);
        console.log('Temporary original file saved:', tempFilePath);

        // 3. Process video (this will also upload thumbnails/previews to R2 and clean them up)
        const result = await processVideo(tempFilePath, fileId);

        // 4. Clean up temporary original video
        fs.unlinkSync(tempFilePath);

        // 5. Add to Postgres database so it appears on the homepage Grid
        await sql`
            INSERT INTO works (id, title, thumbnail_url, preview_url, original_video_url, platform, aspect_ratio)
            VALUES (${fileId}, 'New Upload', ${result.thumbnailPath}, ${result.previewPath}, ${r2OriginalUrl}, 'tiktok', 0.5625)
        `;

        return NextResponse.json({
            success: true,
            id: fileId,
            originalVideoPath: r2OriginalUrl, // Return the R2 URL
            ...result
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
