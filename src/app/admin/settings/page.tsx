'use client';

import { useState, useEffect } from 'react';
import { SiteSettings } from '@/lib/types';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    if (!settings) {
        return <div className="min-h-screen bg-black text-white p-8">No settings found.</div>;
    }

    return (
        <main className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Site Settings</h1>
                    <p className="text-gray-400 mt-2">Manage the site title, description, social links, and crypto addresses.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                        <h2 className="text-xl font-semibold mb-4">General</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Site Title</label>
                            <input
                                type="text"
                                name="title"
                                value={settings.title}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Site Description</label>
                            <textarea
                                name="description"
                                value={settings.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Social Links</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">TikTok URL</label>
                            <input
                                type="url"
                                name="tiktokUrl"
                                value={settings.tiktokUrl}
                                onChange={handleChange}
                                placeholder="https://tiktok.com/@yourusername"
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">X (Twitter) URL</label>
                            <input
                                type="url"
                                name="twitterUrl"
                                value={settings.twitterUrl}
                                onChange={handleChange}
                                placeholder="https://x.com/yourusername"
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
                            />
                        </div>
                    </div>

                    {/* Crypto Donation */}
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Crypto Donation Addresses</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">BTC Address</label>
                            <input
                                type="text"
                                name="btcAddress"
                                value={settings.btcAddress}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ETH Address</label>
                            <input
                                type="text"
                                name="ethAddress"
                                value={settings.ethAddress}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">SOL Address</label>
                            <input
                                type="text"
                                name="solAddress"
                                value={settings.solAddress}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30 font-mono"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>

                    <div className="flex justify-center pt-2">
                        <Link href="/admin/upload" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">アップロード画面に戻る</span>
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
