'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { WorkItem, AdItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface EditWorkModalProps {
    work: WorkItem | AdItem;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditWorkModal({ work, onClose, onSuccess }: EditWorkModalProps) {
    const router = useRouter();
    const [workType, setWorkType] = useState<'work' | 'ad'>(work.type === 'ad' ? 'ad' : 'work');
    const [title, setTitle] = useState(work.title || '');
    
    // Type assertions for work specific fields
    const workData = work as WorkItem;
    const adData = work as AdItem;

    const [description, setDescription] = useState(workData.description || '');
    const initialPlatform = ['TikTok', 'YouTube', 'X', 'Instagram', 'Original'].includes(workData.platform || 'Other') 
        ? (workData.platform || 'TikTok') 
        : 'Other';
    const [platform, setPlatform] = useState(workData.platform ? initialPlatform : 'TikTok');
    const [customPlatform, setCustomPlatform] = useState(initialPlatform === 'Other' ? (workData.platform || '') : '');
    const [originalUrl, setOriginalUrl] = useState(workData.originalUrl || '');
    const [externalUrl, setExternalUrl] = useState(workData.externalUrl || adData.externalUrl || '');
    const [isPublic, setIsPublic] = useState(work.isPublic !== false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm('本当にこのアイテムを削除しますか？\n（サムネイルや動画ファイルも完全に削除されます）');
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/works/${work.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh();
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const data = await res.json();
                alert(`削除に失敗しました: ${data.error || '不明なエラー'}`);
            }
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('削除処理中にエラーが発生しました');
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Title is required.');
            return;
        }

        setSaving(true);
        const finalPlatform = platform === 'Other' ? customPlatform : platform;

        try {
            const completeRes = await fetch(`/api/works/${work.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: workType,
                    title: title.trim(),
                    description: description.trim(),
                    platform: finalPlatform.trim(),
                    originalUrl: originalUrl.trim(),
                    externalUrl: externalUrl.trim(),
                    isPublic,
                })
            });

            if (!completeRes.ok) {
                const errData = await completeRes.json();
                throw new Error(errData.error || 'Failed to update');
            }

            router.refresh();
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            alert('Update failed: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white">Edit Meta Data</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Type Selection */}
                    <div className="flex gap-2 p-1 bg-gray-800 rounded-xl border border-gray-700">
                        <button
                            className={cn("flex-1 py-3 rounded-lg font-medium transition-colors", workType === 'work' ? "bg-white text-black" : "text-gray-400 hover:text-white")}
                            onClick={() => setWorkType('work')}
                        >
                            通常動画 (Regular Video)
                        </button>
                        <button
                            className={cn("flex-1 py-3 rounded-lg font-medium transition-colors", workType === 'ad' ? "bg-white text-black" : "text-gray-400 hover:text-white")}
                            onClick={() => setWorkType('ad')}
                        >
                            広告バナー (Ad Banner)
                        </button>
                    </div>

                    {/* Common Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    {/* Work Specific Fields */}
                    <div className={workType === 'work' ? "space-y-6" : "hidden"}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                                <select 
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                                >
                                    <option value="TikTok">TikTok</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="X">X (Twitter)</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Original">Original</option>
                                    <option value="Other">その他</option>
                                </select>
                            </div>
                            {platform === 'Other' && (
                                <div className="flex-1 animate-in fade-in">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Custom Platform</label>
                                    <input
                                        type="text"
                                        value={customPlatform}
                                        onChange={(e) => setCustomPlatform(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Original SNS URL</label>
                            <input
                                type="url"
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Ad Specific Fields */}
                    <div className={workType === 'ad' ? "space-y-6" : "hidden"}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">External Link URL</label>
                            <input
                                type="url"
                                value={externalUrl}
                                onChange={(e) => setExternalUrl(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    </div>
                    
                    {/* Visibility Setting */}
                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Visibility</label>
                        <select
                            value={isPublic ? 'public' : 'private'}
                            onChange={(e) => setIsPublic(e.target.value === 'public')}
                            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        >
                            <option value="public">Public (公開)</option>
                            <option value="private">Private (非公開)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Privateに設定すると、トップページの一覧からは非表示になります。
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-gray-900/50 flex justify-between items-center gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={saving || deleting}
                        className="px-4 py-2 font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                    >
                        {deleting ? <Loader2 className="animate-spin" size={16} /> : null}
                        Delete Video
                    </button>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-full font-medium text-white hover:bg-white/10 transition-colors"
                            disabled={saving || deleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim() || saving || deleting}
                            className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="animate-spin" size={16} />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
