export type BaseItem = {
  id: string;
  thumbnailUrl: string;
  aspectRatio: number;
}

export type WorkItem = BaseItem & {
  type: 'work';
  title: string;
  previewUrl?: string; // WebP Animation
  originalVideoUrl?: string; // MP4 Original
  platform?: 'tiktok' | 'instagram' | 'youtube';
  views?: string;
};

export type AdItem = BaseItem & {
  type: 'ad';
  linkUrl: string;
  ctaText?: string; // e.g. "Shop Now"
};

export type GridItem = WorkItem | AdItem;
