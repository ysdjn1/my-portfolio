'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ExternalLink, Heart, Share2, Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
import { WorkItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export function DetailModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const workId = searchParams.get('workId');
    const [isOpen, setIsOpen] = useState(false);
    const [work, setWork] = useState<WorkItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [toggling, setToggling] = useState(false);

    // Sync state with URL Param
    useEffect(() => {
        if (workId) {
            setIsOpen(true);
            document.body.style.overflow = 'hidden'; // Lock scroll
            fetchWork(workId);
        } else {
            setIsOpen(false);
            setWork(null);
            document.body.style.overflow = '';
        }
    }, [workId]);

    const fetchWork = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/works/${id}`);
            if (res.ok) {
                const data = await res.json();
                setWork(data);
            }
        } catch (error) {
            console.error('Failed to load work:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Remove query param shallowly
        router.push('/', { scroll: false });
    };

    const handleToggleVisibility = async () => {
        if (!workId || !work) return;

        setToggling(true);
        try {
            const res = await fetch(`/api/works/${workId}/visibility`, {
                method: 'PATCH',
            });

            if (res.ok) {
                const data = await res.json();
                // Update local work state to reflect new visibility immediately
                setWork({ ...work, isPublic: data.isPublic });
                // Force router to refresh so the background grid updates without full page reload
                router.refresh();
            } else {
                alert('表示ステータスの切り替えに失敗しました');
            }
        } catch (err) {
            console.error('Failed to toggle visibility:', err);
            alert('エラーが発生しました');
        } finally {
            setToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!workId) return;
        
        const confirmed = window.confirm('本当にこの動画を削除しますか？\n（サムネイルや動画ファイルも完全に削除されます）');
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/works/${workId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Close modal and refresh the current page to update the grid
                setIsOpen(false);
                router.push('/', { scroll: false });
                router.refresh();
            } else {
                const data = await res.json();
                alert(`削除に失敗しました: ${data.error || '不明なエラー'}`);
            }
        } catch (error) {
            console.error('Failed to delete work:', error);
            alert('削除処理中にエラーが発生しました');
        } finally {
            setDeleting(false);
        }
    };

    if (!workId || !isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
                <Loader2 className="w-8 h-8 text-white animate-spin relative z-10" />
            </div>
        );
    }

    if (!work) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={handleClose}
            />

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
                <X size={24} />
            </button>

            {/* Content Container */}
            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* Left: Video Player Area */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {work.originalVideoUrl ? (
                        <video
                            ref={(el) => {
                                if (el) {
                                    el.volume = 0.3; // Start at 30% volume
                                }
                            }}
                            src={work.originalVideoUrl}
                            controls
                            autoPlay
                            loop
                            playsInline
                            className="max-h-full max-w-full w-auto h-auto object-contain"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-gray-500 mb-2">Original Video Not Available</p>
                            <img src={work.previewUrl || work.thumbnailUrl} className="max-h-[60vh] opacity-50 mx-auto" alt="preview" />
                            <p className="text-xs text-gray-600 mt-2">Playing preview version</p>
                        </div>
                    )}
                </div>

                {/* Right: Metadata Area */}
                <div className="w-full md:w-[400px] flex-shrink-0 bg-gray-900 border-l border-white/5 flex flex-col">
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                            {work.title}
                        </h2>

                        <p className="text-gray-400 leading-relaxed mb-6">
                            This is a sample description for the video. In a real application, this would come from the database metadata.
                            <br /><br />
                            Created using: Premiere Pro, After Effects.
                        </p>

                        {/* Actions */}
                        <div className="space-y-6">
                            {/* Platform Info */}
                            {work.platform && (
                                <div className="flex flex-col pb-4 border-b border-white/5">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider mb-2">Platform</span>
                                    <div className="flex items-center justify-between group">
                                        <span className="text-xl font-mono text-white capitalize">
                                            {work.platform}
                                        </span>
                                        <a href="#" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                            <span>View original</span>
                                            <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                    <Share2 size={20} />
                                    Share
                                </button>
                                
                                <button 
                                    onClick={handleToggleVisibility}
                                    disabled={toggling}
                                    className={cn(
                                        "px-4 py-3 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
                                        work.isPublic 
                                            ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" 
                                            : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                                    )}
                                    title={work.isPublic ? "Make Private" : "Make Public"}
                                >
                                    {toggling ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : work.isPublic ? (
                                        <Eye size={20} />
                                    ) : (
                                        <EyeOff size={20} />
                                    )}
                                    <span className="hidden sm:inline">{work.isPublic ? "Public" : "Private"}</span>
                                </button>

                                <button 
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="px-4 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    title="Delete Video"
                                >
                                    {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
