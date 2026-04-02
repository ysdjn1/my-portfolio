export type BaseItem = {
  id: string;
  thumbnailUrl: string;
  aspectRatio: number;
  isPublic?: boolean;
};

export type WorkItem = BaseItem & {
  type: 'work';
  title: string;
  description?: string;
  previewUrl?: string; // WebP Animation
  originalVideoUrl?: string; // MP4 Original
  originalUrl?: string; // Link to social media original post
  platform?: string;
  views?: string;
  externalUrl?: string; // Optional link to external site
};

export type AdItem = BaseItem & {
  type: 'ad';
  title: string;
  externalUrl?: string;
  ctaText?: string; // e.g. "Shop Now"
};

export type GridItem = WorkItem | AdItem;

export type SiteSettings = {
  id: number;
  title: string;
  description: string;
  tiktokUrl: string;
  twitterUrl: string;
  btcAddress: string;
  ethAddress: string;
  solAddress: string;
};
