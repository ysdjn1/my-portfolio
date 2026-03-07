'use client';

import { AdItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface AdCardProps {
    item: AdItem;
    className?: string;
}

export function AdCard({ item, className }: AdCardProps) {
    return (
        <a
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "relative block rounded-xl overflow-hidden cursor-pointer group break-inside-avoid mb-4",
                "transform transition-transform duration-300 hover:scale-[1.02]",
                "bg-gray-900 border border-white/5",
                className
            )}
        >
            {/* Aspect Ratio Container */}
            <div
                style={{ paddingBottom: `${(1 / item.aspectRatio) * 100}%` }}
                className="relative w-full bg-gray-800"
            >
                <Image
                    src={item.thumbnailUrl}
                    alt="Advertisement"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-opacity duration-500 opacity-90 group-hover:opacity-100"
                />

                {/* Ad Badge */}
                <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                        Ad
                    </span>
                </div>

                {/* CTA Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between text-white">
                        <span className="text-sm font-medium truncate">{item.ctaText || 'Visit Website'}</span>
                        <ExternalLink size={14} className="opacity-80" />
                    </div>
                </div>
            </div>
        </a>
    );
}
