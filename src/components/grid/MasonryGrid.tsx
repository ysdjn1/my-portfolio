'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MasonryGridProps {
    children: ReactNode[];
    className?: string;
    columns?: {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

export function MasonryGrid({
    children,
    className,
    columns = { default: 2, md: 3, lg: 4, xl: 5 }
}: MasonryGridProps) {
    const [columnCount, setColumnCount] = useState(columns.default);

    // Update column count based on window width
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            // Added support for larger screens
            if (width >= 1536 && columns.xl) {
                setColumnCount(columns.xl);
            } else if (width >= 1024 && columns.lg) {
                setColumnCount(columns.lg);
            } else if (width >= 768 && columns.md) {
                setColumnCount(columns.md);
            } else if (width >= 640 && columns.sm) {
                setColumnCount(columns.sm);
            } else {
                setColumnCount(columns.default);
            }
        };

        handleResize(); // Set initial
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [columns]);

    // Distribute children into columns
    const columnWrapper: ReactNode[][] = Array.from({ length: columnCount }, () => []);

    children.forEach((child, index) => {
        columnWrapper[index % columnCount].push(child);
    });

    return (
        <div className={cn("flex gap-4", className)}>
            {columnWrapper.map((col, index) => (
                <div key={index} className="flex flex-col gap-4 flex-1">
                    {col}
                </div>
            ))}
        </div>
    );
}
