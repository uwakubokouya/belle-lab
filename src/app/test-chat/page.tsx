"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/providers/UserProvider';
import Link from 'next/link';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestChatPage() {
    const { user } = useUser();
    const router = useRouter();
    const [profiles, setProfiles] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            const { data } = await supabase.from('sns_profiles').select('*');
            if (data) setProfiles(data);
        };
        fetchProfiles();
    }, []);

    return (
        <div className="min-h-screen bg-[#F9F9F9] font-light">
            <header className="bg-white border-b border-[#E5E5E5] p-4 flex items-center sticky top-0 z-10">
               <button onClick={() => router.back()} className="mr-4 p-2 -ml-2 text-black hover:text-[#777777]"><ChevronLeft size={24} className="stroke-[1.5]"/></button>
               <h1 className="font-bold text-sm tracking-widest text-center flex-1 pr-6">通信テスト用（DBユーザー一覧）</h1>
            </header>
            <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">
                <div className="bg-white border border-[#E5E5E5] p-4 mb-4">
                   <p className="text-xs text-[#777777] mb-2 tracking-widest leading-relaxed">
                     ※ホーム画面のキャストはデモデータ（IDが「1」や「RINA」）のためデータベースに送信できません。<br/>
                     チャット機能をテストするには、以下に表示される「実際にデータベースに登録されたユーザー」同士でやり取りを行ってください。
                   </p>
                   {user && (
                       <p className="text-xs font-bold text-black border-t pt-2 mt-2">
                         現在のログイン情報：<br/><span className="text-[#777777] font-normal break-all">{user.id} ({user.role})</span>
                       </p>
                   )}
                </div>
                
                {profiles.map(p => {
                    const isMe = p.id === user?.id;
                    return (
                        <div key={p.id} className="bg-white border border-[#E5E5E5] p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm tracking-wide mb-1">
                                    {isMe ? 'あなた (ログイン中)' : '登録ユーザー'} 
                                    <span className="ml-2 text-[10px] text-[#777777] bg-[#F0F0F0] px-2 py-0.5">{p.role}</span>
                                </p>
                                <p className="text-[10px] text-[#777777] mb-0.5 tracking-widest truncate max-w-[200px]">ID: {p.id}</p>
                                <p className="text-[10px] text-[#777777] tracking-widest">TEL: {p.phone}</p>
                            </div>
                            {!isMe && (
                                <Link href={`/messages/${p.id}`} className="bg-black text-white p-3 hover:bg-[#333333] transition-colors flex items-center justify-center">
                                    <MessageCircle size={18} className="stroke-[1.5]" />
                                </Link>
                            )}
                        </div>
                    );
                })}

                {profiles.length === 0 && (
                   <p className="text-center text-[#777777] text-xs pt-10">
                     ユーザーが取得できません。<br/>まだアカウントが未作成か、RLSによって取得が制限されています。
                   </p>
                )}
            </div>
        </div>
    );
}
