import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const accountId = "3ba6c7562643b4dea2d6ed3214f76aea"; // Extracted from endpoint
const endpoint = process.env.S3_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
const bucketName = process.env.S3_BUCKET_NAME || '';

// Configure the S3 Client for Cloudflare R2
export const s3Client = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
});

/**
 * Deletes a file from Cloudflare R2.
 * @param fileUrl The public URL of the file to delete
 */
export async function deleteFromR2(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
        // Extract the key from the URL.
        // E.g., https://pub-xxx.r2.dev/originals/123.mp4 -> originals/123.mp4
        const urlObj = new URL(fileUrl);
        // pathname usually starts with a slash, so slice it off
        const key = urlObj.pathname.slice(1);
        
        if (!key) return;

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`Successfully deleted ${key} from R2`);
    } catch (error) {
        console.error(`Error deleting from R2 (${fileUrl}):`, error);
        // We might not want to throw here if we are deleting multiple files
        // and one fails, but let's log it.
    }
}

/**
 * Uploads a file buffer to Cloudflare R2.
 * @param buffer The file data as a Buffer
 * @param fileName The target file name in the bucket
 * @param contentType The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        // Optional: If you want to ensure public read, though R2 bucket policies usually handle this.
        // ACL is generally not needed if the bucket is configured for public access.
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        
        // Return the public URL. 
        // For Cloudflare R2, you either need a custom domain or a dev public URL configured on the bucket.
        // The dev worker URL usually looks like: https://pub-[subdomain].r2.dev/
        // Assuming we map a custom domain `https://media.yourdomain.com/`
        // 🚨 IMPORTANT: Replace `https://pub-your-r2-dev-url.r2.dev` with actual R2 public bucket URL.
        const r2PublicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN || 'https://pub-YOUR-DEV-URL.r2.dev'; 
        return `${r2PublicDomain}/${fileName}`;
    } catch (error) {
        console.error('Error uploading to R2:', error);
        throw error;
    }
}
