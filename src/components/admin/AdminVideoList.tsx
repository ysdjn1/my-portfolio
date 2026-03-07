'use client';

import { WorkItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminVideoList({ works }: { works: WorkItem[] }) {
    const router = useRouter();

    if (!works || works.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-700">
                No videos uploaded yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {works.map((work) => (
                <div
                    key={work.id}
                    onClick={() => router.push(`/admin/upload?workId=${work.id}`, { scroll: false })}
                    className="group relative bg-gray-900 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                    {/* Thumbnail */}
                    <div className="relative aspect-[9/16] w-full bg-gray-800">
                        <Image
                            src={work.thumbnailUrl}
                            alt={work.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                        />
                        
                        {/* Visibility Badge */}
                        <div className="absolute top-2 right-2">
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md",
                                work.isPublic 
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                                    : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            )}>
                                {work.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                                {work.isPublic ? "Public" : "Private"}
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
                                Manage
                            </span>
                        </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="p-3">
                        <p className="text-sm font-medium text-white truncate">{work.title}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{work.platform}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
