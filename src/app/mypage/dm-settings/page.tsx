"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, AlertTriangle } from "lucide-react";
import { useUser } from "@/providers/UserProvider";
import { supabase } from "@/lib/supabase";

export default function DMSettingsPage() {
  const router = useRouter();
  const { user, refreshProfile } = useUser();
  const [acceptsDMs, setAcceptsDMs] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      // Temporary fallback since it defaults to true if column is missing
      setAcceptsDMs(user.settings?.accepts_dms ?? true);
    }
  }, [user]);

  const handleToggle = async (newVal: boolean) => {
    setAcceptsDMs(newVal);
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('sns_profiles')
        .update({ accepts_dms: newVal })
        .eq('id', user.id);
        
      if (error) {
        if (error.message.includes("column \"accepts_dms\" of relation \"sns_profiles\" does not exist")) {
           throw new Error("データベースに『accepts_dms』という列がありません。Supabaseで列を追加してください。");
        }
        throw error;
      }
      
      await refreshProfile();
      setMessage({ type: 'success', text: 'DMの受信設定を更新しました。' });
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "更新に失敗しました" });
      setAcceptsDMs(!newVal); // revert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-light pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
        <button onClick={() => router.back()} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2">メッセージ設定</h1>
      </header>

      <main className="p-6">
        {message && (
          <div className={`mb-6 p-4 border text-xs tracking-widest leading-relaxed ${
            message.type === 'success' 
              ? 'border-green-500 bg-green-50 text-green-700' 
              : 'border-red-500 bg-red-50 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white border border-[#E5E5E5] mb-6">
          <div className="p-5 flex items-center justify-between border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="stroke-[1.5]" />
              <span className="text-sm tracking-widest font-medium">DMの受信</span>
            </div>
            
            <button 
              onClick={() => handleToggle(!acceptsDMs)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${acceptsDMs ? 'bg-black' : 'bg-[#E5E5E5]'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${acceptsDMs ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="p-5 bg-[#F9F9F9]">
            <p className="text-xs text-[#777777] leading-relaxed tracking-widest">
              オフにすると、プロフィール上のDMボタンがグレーアウトされ、お客様からの新規メッセージを受け付けなくなります。出勤していない日や予約が埋まっている時などに活用できます。
            </p>
          </div>
        </div>
        
        {!acceptsDMs && (
            <div className="border border-amber-500 bg-amber-50 p-4 flex gap-3 text-amber-700 animate-in fade-in">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed tracking-widest">
                    現在はDMを受信できない状態です。お客様はあなたにメッセージを送ることができません。
                </p>
            </div>
        )}
      </main>
    </div>
  );
}
