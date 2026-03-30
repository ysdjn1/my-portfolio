'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UploadForm() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [externalUrl, setExternalUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (externalUrl.trim()) {
            formData.append('externalUrl', externalUrl.trim());
        }

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setResult(data);
            
            // Refresh the server component to show the newly uploaded video in the list below
            router.refresh();
            
            // Clear inputs
            setFile(null);
            setExternalUrl('');
            const input = document.getElementById('video-upload-input') as HTMLInputElement;
            if (input) input.value = '';

        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Upload Video</h2>
            <p className="text-gray-400">
                Upload an MP4 video or GIF image. For MP4, the server will automatically generate:
            </p>
            <ul className="list-disc list-inside text-gray-400 ml-4 mb-6">
                <li>A generic thumbnail (at 0s)</li>
                <li>An animated WebP preview (0-5s cutoff)</li>
            </ul>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">External Link URL (Optional)</label>
                    <input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    />
                </div>

                <div className="border border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center gap-4 bg-gray-900/50">
                <input
                    id="video-upload-input"
                    type="file"
                    accept="video/mp4, image/gif"
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
                    {uploading ? 'Processing...' : 'Upload & Process'}
                </button>
                </div>
            </div>

            {result && (
                <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-green-400">Success!</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Generated Thumbnail (JPG)</span>
                            <img src={result.thumbnailPath} className="rounded-lg w-full" alt="Thumb" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Generated Preview (WebP)</span>
                            <img src={result.previewPath} className="rounded-lg w-full" alt="Preview" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
