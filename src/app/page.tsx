import { MasonryGrid } from "@/components/grid/MasonryGrid";
import { WorkCard } from "@/components/grid/WorkCard";
import { AdCard } from "@/components/grid/AdCard";
import { DetailModal } from "@/components/modal/DetailModal";
import { getWorks } from "@/lib/api/works";
import { getSiteSettings } from "@/lib/api/settings";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CuteGirls.ai | AI美女ショート動画コレクション",
};

export default async function Home() {
  const works = await getWorks();
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="w-full max-w-[2560px] mx-auto h-32 md:h-auto md:aspect-[2560/423] max-h-[423px] relative overflow-hidden bg-gray-900">
        <img 
          src="/banner.jpg" 
          alt="Site Banner" 
          className="absolute inset-0 w-full h-full object-cover object-center" 
        />
        <div className="sr-only">
          <h1>{settings?.title || "A secret collection of cute girls"}</h1>
          <p>{settings?.description || "A collection of short video content spanning TikTok, Instagram, and other platforms."}</p>
        </div>
      </header>

      <div className="w-full max-w-[1920px] mx-auto px-2 md:px-6 pt-6 md:pt-12 pb-12">
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
