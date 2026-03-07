import { MasonryGrid } from "@/components/grid/MasonryGrid";
import { WorkCard } from "@/components/grid/WorkCard";
import { AdCard } from "@/components/grid/AdCard";
import { DetailModal } from "@/components/modal/DetailModal";
import { getWorks } from "@/lib/api/works";
import { Suspense } from "react";

export default async function Home() {
  const works = await getWorks();

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
          Junichi's Archive
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          A collection of short-form video content across TikTok, Instagram, and YouTube.
        </p>
      </header>

      <div className="w-full max-w-[1920px] mx-auto px-2 md:px-6">
        <MasonryGrid>
          {works.map((item) => (
            item.type === 'ad'
              ? <AdCard key={item.id} item={item} />
              : <WorkCard key={item.id} work={item} />
          ))}
        </MasonryGrid>
      </div>

      <Suspense fallback={null}>
        <DetailModal />
      </Suspense>
    </main>
  );
}
