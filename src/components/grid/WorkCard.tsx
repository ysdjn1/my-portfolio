'use client';

import { WorkItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Play, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

import { useRouter } from 'next/navigation';

interface WorkCardProps {
    work: WorkItem;
    className?: string;
    priority?: boolean;
}

export function WorkCard({ work, className, priority = false }: WorkCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    const isExternal = !!work.externalUrl;
    const isVideo = work.originalVideoUrl?.match(/\.(mp4|webm|mov)$/i) || work.thumbnailUrl?.match(/\.(mp4|webm|mov)$/i);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (isVideo && videoRef.current) {
            videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (isVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const handleClick = () => {
        if (!isExternal) {
            router.push(`/?workId=${work.id}`, { scroll: false });
        }
    };

    const Container = isExternal ? 'a' : 'div';
    const containerProps = isExternal 
        ? { href: work.externalUrl, target: "_blank", rel: "noopener noreferrer" }
        : { onClick: handleClick };

    return (
        <Container
            {...containerProps}
            className={cn(
                "relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid mb-4",
                "transform transition-transform duration-300 hover:scale-[1.02]",
                "bg-gray-900 border border-white/5",
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Aspect Ratio Container */}
            <div
                style={{ paddingBottom: `${(1 / work.aspectRatio) * 100}%` }}
                className="relative w-full bg-gray-800"
            >
                {/* External Link Badge */}
                {isExternal && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 z-10 shadow-lg">
                        <LinkIcon size={12} className="text-white"/> 
                        <span className="text-xs text-white font-medium shadow-sm">Fan Site</span>
                    </div>
                )}

                {/* Media Layer */}
                {isVideo ? (
                    <video
                        ref={videoRef}
                        src={work.originalVideoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                    />
                ) : (
                    <Image
                        src={work.thumbnailUrl}
                        alt={work.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-opacity duration-500"
                        priority={priority}
                        unoptimized={work.thumbnailUrl?.toLowerCase().endsWith('.gif')}
                    />
                )}

                {/* Play Icon (Only visible when NO preview is playing/available) */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    (isHovered && work.previewUrl) ? "opacity-0" : "opacity-100 group-hover:opacity-100"
                )}>
                    <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={20} fill="currentColor" />
                    </div>
                </div>

                {/* Overlay Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium truncate">{work.title}</p>
                    <p className="text-white/60 text-xs capitalize mt-0.5">{work.platform}</p>
                </div>
            </div>
        </Container>
    );
}
