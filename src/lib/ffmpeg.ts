import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { uploadToR2 } from './s3';

// Hardcode path strategy for this environment
const localBinary = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

// Force use the local binary found in node_modules
ffmpeg.setFfmpegPath(localBinary);
console.log('FFmpeg Path FORCE set to:', localBinary);

interface ProcessResult {
    thumbnailPath: string;
    previewPath: string;
}

export async function processVideo(
    inputPath: string,
    fileId: string
): Promise<ProcessResult> {
    const tmpDir = path.join(process.cwd(), '.temp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const thumbnailFilename = `${fileId}.jpg`;
    const previewFilename = `${fileId}.webp`;

    const thumbnailOutputPath = path.join(tmpDir, thumbnailFilename);
    const previewOutputPath = path.join(tmpDir, previewFilename);

    // Return promise that resolves when BOTH processing steps are done
    return new Promise((resolve, reject) => {
        // 1. Generate Animated WebP Preview (0-5s)
        ffmpeg(inputPath)
            .setStartTime(0)
            .setDuration(5)
            .fps(15) // Lower FPS for lightweight preview
            .size('480x?') // Resize width to 480px, maintain aspect ratio
            .outputOptions([
                '-vcodec libwebp',
                '-loop 0', // Infinite loop
                '-preset default',
                '-an' // Remove audio
            ])
            .save(previewOutputPath)
            .on('end', async () => {
                try {
                console.log('Preview generated in temp:', previewOutputPath);

                // Upload WebP to R2
                const previewBuffer = fs.readFileSync(previewOutputPath);
                console.log('Uploading WebP Preview to R2...');
                const r2PreviewUrl = await uploadToR2(previewBuffer, `previews/${previewFilename}`, 'image/webp');
                console.log('WebP Preview Uploaded:', r2PreviewUrl);
                
                // Clean up temp preview
                fs.unlinkSync(previewOutputPath);

                // 2. Generate Static Thumbnail (at 0s)
                ffmpeg(inputPath)
                    .screenshots({
                        timestamps: [0],
                        filename: thumbnailFilename,
                        folder: tmpDir,
                        size: '480x?'
                    })
                    .on('end', async () => {
                        try {
                        console.log('Thumbnail generated in temp:', thumbnailOutputPath);
                        
                        // Upload JPG to R2
                        const thumbnailBuffer = fs.readFileSync(thumbnailOutputPath);
                        console.log('Uploading JPG Thumbnail to R2...');
                        const r2ThumbnailUrl = await uploadToR2(thumbnailBuffer, `thumbnails/${thumbnailFilename}`, 'image/jpeg');
                        console.log('JPG Thumbnail Uploaded:', r2ThumbnailUrl);

                        // Clean up temp thumbnail
                        fs.unlinkSync(thumbnailOutputPath);

                        resolve({
                            thumbnailPath: r2ThumbnailUrl,
                            previewPath: r2PreviewUrl
                        });
                        } catch (err) {
                            console.error('Error during thumbnail upload:', err);
                            reject(err);
                        }
                    })
                    .on('error', (err) => {
                        console.error('Error generating thumbnail:', err);
                        reject(err);
                    });
                } catch (err) {
                    console.error('Error during preview upload/processing:', err);
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.error('Error generating preview:', err);
                reject(err);
            });
    });
}
