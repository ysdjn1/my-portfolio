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
    const router = useRouter();

    const isExternal = !!work.externalUrl;

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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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

                {/* Thumbnail Image */}
                <Image
                    src={work.thumbnailUrl}
                    alt={work.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className={cn(
                        "object-cover transition-opacity duration-500",
                        (isHovered && work.previewUrl) ? "opacity-0" : "opacity-100"
                    )}
                    priority={priority}
                />

                {/* WebP Preview Layer (Instead of Video) */}
                {work.previewUrl && (
                    <img
                        src={work.previewUrl}
                        alt={`${work.title} preview`}
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}
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
