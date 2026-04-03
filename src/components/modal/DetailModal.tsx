'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, ExternalLink, Heart, Share2, Loader2, Trash2, Eye, EyeOff, Music2, Twitter, Coins, Copy, Check } from 'lucide-react';
import { WorkItem, SiteSettings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@next/third-parties/google';

export function DetailModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const workId = searchParams.get('workId');
    const isAdminUser = pathname?.startsWith('/admin');
    const [isOpen, setIsOpen] = useState(false);
    const [work, setWork] = useState<WorkItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isTippingOpen, setIsTippingOpen] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    // Sync state with URL Param
    useEffect(() => {
        const fetchInitialSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) setSettings(await res.json());
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        };
        fetchInitialSettings();
    }, []);

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
                sendGAEvent({ event: 'view_video', video_id: data.id, platform: data.platform });
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
        router.push(pathname || '/', { scroll: false });
    };

    const handleCopy = async (address: string, coin: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(coin);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleShare = async () => {
        if (!work) return;
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: work.title,
                    url: shareUrl,
                });
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('リンクをクリップボードにコピーしました');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('クリップボードへのコピーに失敗しました');
            }
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
            <div className="relative w-full max-w-6xl md:h-full max-h-[90vh] bg-gray-900 rounded-3xl overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* Left: Video Player Area */}
                <div className="flex-1 bg-black flex items-center justify-center relative z-0">
                    {work.originalVideoUrl ? (
                        work.originalVideoUrl.toLowerCase().endsWith('.gif') ? (
                            <img
                                src={work.originalVideoUrl}
                                alt={work.title}
                                className="max-h-full max-w-full w-auto h-auto object-contain"
                            />
                        ) : (
                        <video
                            ref={(el) => {
                                if (el) {
                                    el.volume = 0.3; // Start at 30% volume
                                }
                            }}
                            src={work.originalVideoUrl}
                            controls
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                            autoPlay
                            loop
                            playsInline
                            className="max-h-full max-w-full w-auto h-auto object-contain"
                        />
                        )
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-gray-500 mb-2">Original Video Not Available</p>
                            <img src={work.previewUrl || work.thumbnailUrl} className="max-h-[60vh] opacity-50 mx-auto" alt="preview" />
                            <p className="text-xs text-gray-600 mt-2">Playing preview version</p>
                        </div>
                    )}
                </div>

                {/* Right: Metadata Area */}
                <div className="w-full md:w-[400px] flex-shrink-0 bg-gray-900 border-l border-white/5 flex flex-col relative z-50">
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                        <h2 className={cn("text-2xl md:text-3xl font-bold text-white leading-tight", work.description ? "mb-2" : "mb-6")}>
                            {work.title}
                        </h2>

                        {work.description && (
                            <p className="text-gray-400 leading-relaxed mb-6 whitespace-pre-wrap">
                                {work.description}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="space-y-6">
                            {/* Info & Creator Links */}
                            {(work.platform || settings?.tiktokUrl || settings?.twitterUrl || settings?.btcAddress || settings?.ethAddress || settings?.solAddress) && (
                                <div className="flex flex-col pb-4 border-b border-white/5 space-y-4">
                                    {/* Platform & SNS Row */}
                                    {(work.platform || settings?.tiktokUrl || settings?.twitterUrl) && (
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Platform & Creator</span>
                                            <div className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    {work.platform && (
                                                        <span className="text-xl font-mono text-white capitalize">
                                                            {work.platform}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {settings?.tiktokUrl && (
                                                            <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white" onClick={() => sendGAEvent({ event: 'click_sns', platform: 'TikTok' })}>
                                                                <Music2 size={16} />
                                                            </a>
                                                        )}
                                                        {settings?.twitterUrl && (
                                                            <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white" onClick={() => sendGAEvent({ event: 'click_sns', platform: 'Twitter' })}>
                                                                <Twitter size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {work.originalUrl && work.platform !== 'Original' && (
                                                    <a href={work.originalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors" onClick={() => sendGAEvent({ event: 'click_sns', platform: work.platform })}>
                                                        <span>View original</span>
                                                        <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tipping Row */}
                                    {(settings?.btcAddress || settings?.ethAddress || settings?.solAddress) && (
                                        <div className="relative flex justify-start pt-2">
                                            <button 
                                                onClick={() => {
                                                    setIsTippingOpen(!isTippingOpen);
                                                    if (!isTippingOpen && work) {
                                                        sendGAEvent({ event: 'click_tip', video_id: work.id });
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-full transition-colors font-bold text-sm"
                                            >
                                                <Coins size={16} />
                                                Tip Creator
                                            </button>
                                            
                                            {isTippingOpen && document.body && createPortal(
                                                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTippingOpen(false)} />
                                                    <div className="relative w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                                                        <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-between">
                                                            Send to the creator
                                                            <button onClick={() => setIsTippingOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {settings?.btcAddress && (
                                                                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl group border border-white/5 hover:border-white/10 transition-colors">
                                                                    <span className="text-sm font-mono text-gray-300">Bitcoinアドレス</span>
                                                                    <button onClick={() => handleCopy(settings.btcAddress, 'BTC')} className="p-2 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg text-gray-400 transition-colors flex items-center gap-2">
                                                                        {copiedAddress === 'BTC' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                                        <span className="text-xs font-bold">{copiedAddress === 'BTC' ? 'Copied' : 'Copy'}</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {settings?.ethAddress && (
                                                                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl group border border-white/5 hover:border-white/10 transition-colors">
                                                                    <span className="text-sm font-mono text-gray-300">Ethereumアドレス</span>
                                                                    <button onClick={() => handleCopy(settings.ethAddress, 'ETH')} className="p-2 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg text-gray-400 transition-colors flex items-center gap-2">
                                                                        {copiedAddress === 'ETH' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                                        <span className="text-xs font-bold">{copiedAddress === 'ETH' ? 'Copied' : 'Copy'}</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {settings?.solAddress && (
                                                                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl group border border-white/5 hover:border-white/10 transition-colors">
                                                                    <span className="text-sm font-mono text-gray-300">Solanaアドレス</span>
                                                                    <button onClick={() => handleCopy(settings.solAddress, 'SOL')} className="p-2 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg text-gray-400 transition-colors flex items-center gap-2">
                                                                        {copiedAddress === 'SOL' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                                        <span className="text-xs font-bold">{copiedAddress === 'SOL' ? 'Copied' : 'Copy'}</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>,
                                                document.body
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleShare}
                                    className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Share2 size={20} />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
