'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function UploadForm() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [workType, setWorkType] = useState<'work' | 'ad'>('work');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [platform, setPlatform] = useState('tiktok');
    const [customPlatform, setCustomPlatform] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !title.trim()) {
            alert('File and Title are required.');
            return;
        }

        setUploading(true);
        setProgress(0);
        setResult(null);

        const finalPlatform = platform === 'Other' ? customPlatform : platform;

        try {
            // 1. Get presigned URL
            const presignedRes = await fetch('/api/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                })
            });

            if (!presignedRes.ok) {
                const errData = await presignedRes.json();
                throw new Error(errData.error || 'Failed to get presigned URL');
            }

            const { uploadUrl, publicUrl, fileId } = await presignedRes.json();

            // 2. Upload directly to S3/R2 using XMLHttpRequest for progress tracking
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed due to network error'));
                });

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                xhr.send(file);
            });

            // 3. Confirm upload and save to DB
            const completeRes = await fetch('/api/upload/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileId,
                    publicUrl,
                    type: workType,
                    title: title.trim(),
                    description: workType === 'work' ? description.trim() : '',
                    platform: workType === 'work' ? finalPlatform.trim() : '',
                    originalUrl: workType === 'work' ? originalUrl.trim() : '',
                    externalUrl: workType === 'ad' ? externalUrl.trim() : '',
                })
            });

            if (!completeRes.ok) {
                const errData = await completeRes.json();
                throw new Error(errData.error || 'Failed to complete upload');
            }

            setResult({
                thumbnailPath: publicUrl,
                previewPath: publicUrl,
                originalVideoPath: publicUrl
            });
            
            setProgress(100);
            router.refresh();
            
            // Clear inputs
            setFile(null);
            setTitle('');
            setDescription('');
            setOriginalUrl('');
            setCustomPlatform('');
            setExternalUrl('');
            const input = document.getElementById('video-upload-input') as HTMLInputElement;
            if (input) input.value = '';

        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setUploading(false);
            if (progress === 100) {
                setTimeout(() => setProgress(0), 3000); // Clear progress bar after a few seconds on success
            } else {
                 setProgress(0); // clear on failure immediately
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Upload Media</h2>
            <p className="text-gray-400">
                Upload a video or image. This will bypass Vercel limits by directly uploading to Cloudflare R2.
            </p>

            <div className="space-y-4">
                {/* Type Selection */}
                <div className="flex gap-2 p-1 bg-gray-900 rounded-xl mb-6 border border-gray-700">
                    <button
                        className={cn("flex-1 py-3 rounded-lg font-medium transition-colors", workType === 'work' ? "bg-white text-black" : "text-gray-400 hover:text-white")}
                        onClick={() => setWorkType('work')}
                    >
                        通常動画 (Regular Video)
                    </button>
                    <button
                        className={cn("flex-1 py-3 rounded-lg font-medium transition-colors", workType === 'ad' ? "bg-white text-black" : "text-gray-400 hover:text-white")}
                        onClick={() => setWorkType('ad')}
                    >
                        広告バナー (Ad Banner)
                    </button>
                </div>

                {/* Common Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My awesome video"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    />
                </div>

                {/* Work Specific Fields */}
                {workType === 'work' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the video..."
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                                <select 
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                                >
                                    <option value="TikTok">TikTok</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="X">X (Twitter)</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Original">Original</option>
                                    <option value="Other">その他</option>
                                </select>
                            </div>
                            {platform === 'Other' && (
                                <div className="flex-1 animate-in fade-in">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Custom Platform</label>
                                    <input
                                        type="text"
                                        value={customPlatform}
                                        onChange={(e) => setCustomPlatform(e.target.value)}
                                        placeholder="Vimeo, Facebook, etc."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Original SNS URL</label>
                            <input
                                type="url"
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                                placeholder="https://tiktok.com/..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    </>
                )}

                {/* Ad Specific Fields */}
                {workType === 'ad' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">External Link URL</label>
                        <input
                            type="url"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="https://example.com/shop"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>
                )}


                <div className="border border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center gap-4 bg-gray-900/50">
                <input
                    id="video-upload-input"
                    type="file"
                    accept="video/mp4, image/gif, video/quicktime, video/webm"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-white file:text-black
              hover:file:bg-gray-200
            "
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 flex items-center gap-2"
                >
                    {uploading && <Loader2 className="animate-spin" />}
                    {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
                </div>
            </div>

            {progress > 0 && typeof progress === 'number' && (
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                    <div 
                        className="bg-blue-500 h-4 transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }} 
                    />
                    <div className="text-xs text-center text-gray-400 mt-1">{progress}% Complete</div>
                </div>
            )}

            {result && (
                <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-green-400">Success!</h3>
                    <div>
                        <span className="text-xs text-gray-400 block mb-1">Uploaded Media URL</span>
                        <a href={result.originalVideoPath} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                            {result.originalVideoPath}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
