import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/s3';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const { filename, contentType } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
        }

        const fileId = crypto.randomUUID();
        const extension = path.extname(filename);
        const newFilename = `originals/${fileId}${extension}`;

        const { uploadUrl, publicUrl } = await generatePresignedUrl(newFilename, contentType);

        return NextResponse.json({
            uploadUrl,
            publicUrl,
            fileId,
            newFilename
        });

    } catch (error) {
        console.error('Error generating presigned url:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
