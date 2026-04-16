"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Send } from "lucide-react";

export default function AnnouncementAdminPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("お知らせ");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/login');
            } else if (!user.is_admin) {
                alert("アクセス権限がありません。");
                router.replace('/mypage');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user?.is_admin) {
        return <div className="min-h-screen bg-white" />;
    }

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setIsModalOpen(true);
    };

    const executeSubmit = async () => {
        setIsModalOpen(false);
        setIsSubmitting(true);
        setMessage(null);

        try {
            const { error } = await supabase.from('sns_notifications').insert({
                title: title.trim(),
                content: content.trim(),
                type: type
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'お知らせを配信しました！' });
            setTitle("");
            setContent("");
        } catch (err: any) {
            console.error("Notification Error:", err);
            setMessage({ type: 'error', text: 'お知らせの配信に失敗しました。' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-light">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
                <button onClick={() => router.push('/mypage')} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors">
                    <ChevronLeft size={24} className="stroke-[1.5]" />
                </button>
                <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2">お知らせ配信（管理用）</h1>
            </header>

            <main className="p-6">
                <div className="bg-white border border-[#E5E5E5] p-6 mb-8">
                    <h2 className="text-xs uppercase tracking-widest text-[#777777] mb-6 font-medium">全体へのニュース配信</h2>
                    
                    {message && (
                        <div className={`mb-6 p-4 border text-xs tracking-widest leading-relaxed ${
                            message.type === 'success' 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-red-500 bg-red-50 text-red-600'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePreSubmit} className="space-y-6">
                        <div className="space-y-2 block">
                            <label className="text-[10px] uppercase tracking-widest text-[#777777]">Type (カテゴリ)</label>
                            <div className="relative">
                                <select 
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full border-b border-[#E5E5E5] pb-2 text-sm outline-none focus:border-black transition-colors bg-transparent rounded-none appearance-none cursor-pointer"
                                >
                                    <option value="お知らせ">📢 お知らせ (通常)</option>
                                    <option value="重要">⚠️ 重要 (営業時間変更など)</option>
                                    <option value="イベント">🎉 イベント</option>
                                    <option value="キャンペーン">🎁 キャンペーン・お得情報</option>
                                    <option value="新人入店">✨ 新人入店</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#777777]">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 block">
                            <label className="text-[10px] uppercase tracking-widest text-[#777777]">Title (タイトル)</label>
                            <input 
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border-b border-[#E5E5E5] pb-2 text-base outline-none focus:border-black transition-colors bg-transparent rounded-none"
                                placeholder="例：年末年始の営業について"
                            />
                        </div>

                        <div className="space-y-2 block">
                            <label className="text-[10px] uppercase tracking-widest text-[#777777]">Content (本文)</label>
                            <textarea 
                                required
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full border-b border-[#E5E5E5] pb-2 pt-2 min-h-[150px] text-sm outline-none focus:border-black transition-colors bg-transparent rounded-none resize-none leading-relaxed"
                                placeholder="お知らせの詳細内容をご記入ください..."
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                            className="premium-btn w-full flex items-center justify-center gap-3 py-4 text-sm tracking-widest disabled:opacity-50 mt-6"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={18} className="stroke-[1.5]" />
                                    今すぐ配信する
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm p-6 space-y-6">
                        <h3 className="text-sm font-bold tracking-widest text-center border-b border-[#E5E5E5] pb-4">配信内容の確認</h3>
                        
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <p className="text-[10px] text-[#777777] uppercase tracking-widest mb-1">Type</p>
                                <p className="text-sm border border-[#E5E5E5] p-3 bg-[#F9F9F9] text-black w-full break-words">
                                    <span className="font-bold">{type}</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#777777] uppercase tracking-widest mb-1">Title</p>
                                <p className="text-sm border border-[#E5E5E5] p-3 bg-[#F9F9F9] text-black w-full break-words">{title}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#777777] uppercase tracking-widest mb-1">Content</p>
                                <p className="text-sm border border-[#E5E5E5] p-3 bg-[#F9F9F9] whitespace-pre-wrap text-black w-full break-words leading-relaxed">{content}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-[11px] tracking-widest border border-[#E5E5E5] text-[#777777] font-medium hover:bg-[#F9F9F9] transition-colors"
                            >
                                戻る
                            </button>
                            <button 
                                onClick={executeSubmit}
                                className="flex-1 py-3 text-[11px] tracking-widest font-medium bg-black text-white hover:bg-black/80 transition-colors"
                            >
                                配信する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
