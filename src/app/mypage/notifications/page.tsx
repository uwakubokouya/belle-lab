"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Bell, AlertTriangle, PartyPopper, Gift, Sparkles, Info, Heart } from "lucide-react";

export default function NotificationsPage() {
    const { user, markNotificationsAsRead } = useUser();
    
    const getTypeDisplay = (type: string) => {
        switch(type) {
            case '重要': return { 
                cardClass: 'bg-[#FFFBEB] border-[#FDE68A] hover:bg-[#FEF3C7]', 
                icon: AlertTriangle, 
                colorClass: 'text-[#D97706]' 
            };
            case 'イベント': return { 
                cardClass: 'bg-white border-[#E5E5E5] hover:bg-[#F9F9F9]', 
                icon: PartyPopper, 
                colorClass: 'text-[#D97706]' 
            };
            case 'キャンペーン': return { 
                cardClass: 'bg-white border-[#E5E5E5] hover:bg-[#F9F9F9]', 
                icon: Gift, 
                colorClass: 'text-[#059669]' 
            };
            case '新人入店': return { 
                cardClass: 'bg-white border-[#E5E5E5] hover:bg-[#F9F9F9]', 
                icon: Sparkles, 
                colorClass: 'text-[#DB2777]' 
            };
            case 'like': return { 
                cardClass: 'bg-white border-[#E5E5E5] hover:bg-[#F9F9F9]', 
                icon: Heart, 
                colorClass: 'text-[#E02424]' 
            };
            default: return { 
                cardClass: 'bg-white border-[#E5E5E5] hover:bg-[#F9F9F9]', 
                icon: Info, 
                colorClass: 'text-[#777777]' 
            };
        }
    };
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const stored = localStorage.getItem('read_notifications');
            if (stored) {
                setReadIds(new Set(JSON.parse(stored)));
            }
        } catch (e) {
            // ignore
        }

        const fetchNotifications = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            
            const { data } = await supabase
                .from('sns_notifications')
                .select('*')
                .or(`user_id.is.null,user_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (data) {
                setNotifications(data);
            }
            setIsLoading(false);
        };

        fetchNotifications();
    }, [markNotificationsAsRead, user]);

    const handleTap = (note: any) => {
        setSelectedNote(note);
        
        // Mark as read for this specific card
        const newReadIds = new Set(readIds);
        newReadIds.add(note.id);
        setReadIds(newReadIds);
        localStorage.setItem('read_notifications', JSON.stringify(Array.from(newReadIds)));
        
        // Clear global bell
        markNotificationsAsRead();
    };

    return (
        <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-light pb-24">
            <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
                <button onClick={() => router.push('/mypage')} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors">
                    <ChevronLeft size={24} className="stroke-[1.5]" />
                </button>
                <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2">お知らせ</h1>
            </header>

            <main className="p-4 space-y-4">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(note => {
                        const display = getTypeDisplay(note.type);
                        const Icon = display.icon;
                        const isUnread = !readIds.has(note.id);
                        
                        return (
                            <div 
                                key={note.id} 
                                onClick={() => handleTap(note)}
                                className={`relative ${display.cardClass} p-5 shadow-sm cursor-pointer transition-colors`}
                            >
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Icon size={14} className={display.colorClass} />
                                    <span className={`text-[10px] font-bold tracking-widest ${display.colorClass}`}>
                                        {note.type || "お知らせ"}
                                    </span>
                                    
                                    {isUnread ? (
                                        <Bell size={14} className="text-[#E02424] fill-[#E02424] ml-auto animate-ring origin-top" />
                                    ) : (
                                        <Bell size={14} className="text-[#777777] ml-auto" />
                                    )}
                                    <span className="text-[10px] text-[#777777] font-medium tracking-widest">
                                        {new Date(note.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                    </span>
                                </div>
                                <h2 className="text-sm font-bold tracking-widest text-black leading-relaxed line-clamp-2">{note.title}</h2>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center text-[#777777]">
                        <p className="text-xs tracking-widest">現在お知らせはありません</p>
                    </div>
                )}
            </main>

            {/* Content Modal */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                     onClick={() => setSelectedNote(null)}>
                    <div className="bg-white w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 mb-2">
                            {(() => {
                                const display = getTypeDisplay(selectedNote.type);
                                const Icon = display.icon;
                                return (
                                    <>
                                        <Icon size={14} className={display.colorClass} />
                                        <span className={`text-[10px] font-bold tracking-widest ${display.colorClass}`}>
                                            {selectedNote.type || "お知らせ"}
                                        </span>
                                    </>
                                );
                            })()}
                            <span className="text-[10px] text-[#777777] font-medium tracking-widest ml-auto">
                                {new Date(selectedNote.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </span>
                        </div>
                        <h3 className="text-sm font-bold tracking-widest border-b border-[#E5E5E5] pb-4">{selectedNote.title}</h3>
                        
                        <div className="max-h-[50vh] overflow-y-auto pt-2">
                            <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-wrap">{selectedNote.content}</p>
                        </div>
                        
                        <div className="pt-4">
                            <button 
                                onClick={() => setSelectedNote(null)}
                                className="w-full py-3 text-xs tracking-widest bg-black text-white hover:bg-black/80 transition-colors mt-2"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
