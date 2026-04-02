'use client';

import { WorkItem, AdItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { EditWorkModal } from './EditWorkModal';

export function AdminVideoList({ works }: { works: (WorkItem | AdItem)[] }) {
    const router = useRouter();
    const [editingWork, setEditingWork] = useState<WorkItem | AdItem | null>(null);

    if (!works || works.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
                No videos uploaded yet.
            </div>
        );
    }

    return (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {works.map((work) => {
                const isThumbnailImage = !!work.thumbnailUrl?.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
                const hasOriginalVideo = work.type === 'work' && !!(work as WorkItem).originalVideoUrl?.match(/\.(mp4|webm|mov|qt)(\?.*)?$/i);
                const isVideo = hasOriginalVideo || !!work.thumbnailUrl?.match(/\.(mp4|webm|mov|qt)(\?.*)?$/i);

                return (
                <div
                    key={work.id}
                    onClick={() => setEditingWork(work)}
                    className="group relative bg-gray-900 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                    {/* Thumbnail */}
                    <div className="relative aspect-[9/16] w-full bg-gray-800">
                        {isVideo ? (
                            <video
                                src={work.type === 'work' ? (work as WorkItem).originalVideoUrl : work.thumbnailUrl}
                                poster={isThumbnailImage ? work.thumbnailUrl : undefined}
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                            />
                        ) : (
                            <Image
                                src={work.thumbnailUrl}
                                alt={work.title}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                                unoptimized={work.thumbnailUrl?.toLowerCase().endsWith('.gif')}
                            />
                        )}
                        
                        {/* Type Badge for Ad */}
                        {work.type === 'ad' && (
                            <div className="absolute top-2 left-2 z-10">
                                <span className="bg-yellow-500/90 text-black px-2 py-1 rounded border border-yellow-400/50 text-[10px] font-black tracking-wider uppercase backdrop-blur-sm shadow-sm">
                                    AD
                                </span>
                            </div>
                        )}

                        {/* Visibility Badge */}
                        <div className="absolute top-2 right-2 z-10">
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md",
                                work.isPublic !== false
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                                    : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            )}>
                                {work.isPublic !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                                {work.isPublic !== false ? "Public" : "Private"}
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-blue-600/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm shadow-xl flex items-center gap-2">
                                Edit
                            </span>
                        </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="p-3">
                        <p className="text-sm font-medium text-white truncate">{work.title}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">
                            {work.type === 'ad' ? 'Ad Banner' : (work as WorkItem).platform}
                        </p>
                    </div>
                </div>
            )})}
        </div>
        
        {editingWork && (
            <EditWorkModal 
                work={editingWork} 
                onClose={() => setEditingWork(null)} 
            />
        )}
        </>
    );
}
