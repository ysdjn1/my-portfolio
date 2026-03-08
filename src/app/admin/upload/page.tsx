import { UploadForm } from '@/components/admin/UploadForm';
import { AdminVideoList } from '@/components/admin/AdminVideoList';
import { DetailModal } from '@/components/modal/DetailModal';
import { getWorks } from '@/lib/api/works';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function UploadPage() {
    // Fetch all works, including private ones, directly from the database
    const works = await getWorks(true);

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-16">
                
                {/* Section 1: Upload Form */}
                <section className="bg-gray-900/30 border border-white/5 p-6 md:p-8 rounded-3xl">
                    <UploadForm />
                </section>

                {/* Section 2: Management List */}
                <section className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            All Videos
                            <span className="text-sm font-normal text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                                {works.length} items
                            </span>
                        </h2>
                        <p className="text-gray-400 mt-1">Manage visibility and delete uploaded videos.</p>
                    </div>

                    <AdminVideoList works={works.filter(w => w.type === 'work') as import('@/lib/types').WorkItem[]} />
                </section>
            </div>

            {/* Detail Modal layer to show exactly the same management modal from the homepage */}
            <Suspense fallback={null}>
                <DetailModal />
            </Suspense>
        </main>
    );
}
