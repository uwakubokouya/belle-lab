"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Inbox, Check, CheckCircle2, X, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/providers/UserProvider";

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user, refreshUnreadFeedbacks } = useUser();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [resultModal, setResultModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({ isOpen: false, type: 'success', message: "" });

  // Auth Guard
  useEffect(() => {
    if (user && !user.is_admin) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.is_admin) return;

    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('sns_feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setFeedbacks(data);
      }
      setIsLoading(false);
    };

    fetchFeedbacks();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('sns_feedbacks')
      .update({ status: 'read' })
      .eq('id', id);

    if (!error) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'read' } : f));
      refreshUnreadFeedbacks();
    }
  };

  const handleNameClick = async (userId: string | null) => {
    if (!userId) return;
    setIsModalOpen(true);
    setIsLoadingUser(true);
    const { data, error } = await supabase
      .from('sns_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setSelectedUser(data);
    } else {
      setSelectedUser(null);
    }
    setIsLoadingUser(false);
  };

  const handleResetPasswordClick = () => {
    if (!selectedUser?.id) return;
    setIsConfirmResetOpen(true);
  };

  const executeResetPassword = async () => {
    if (!selectedUser?.id) return;
    
    setIsConfirmResetOpen(false);

    setIsResetting(true);
    
    const { error } = await supabase.rpc('_admin_reset_password_to_zero', { 
      target_user_id: selectedUser.id 
    });

    if (error) {
      console.error(error);
      setResultModal({ isOpen: true, type: 'error', message: 'パスワードの初期化に失敗しました。\nSupabaseでSQLが正しく実行されているかご確認ください。' });
    } else {
      setResultModal({ isOpen: true, type: 'success', message: `「${selectedUser.name || '名無し'}」のパスワードを「000000」に初期化しました！\nお客様に「000000」でログインして変更するようにお伝えください。` });
    }
    
    setIsResetting(false);
  };

  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-light">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
        <button onClick={() => router.back()} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
           <Inbox size={16} className="stroke-[1.5]"/>
           ご意見・ご要望 管理
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-40">
        {isLoading ? (
          <div className="flex justify-center py-20">
             <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((item) => (
              <div key={item.id} className="bg-white border border-[#E5E5E5] p-5 shadow-sm relative overflow-hidden">
                {item.status !== 'read' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#E02424]"></div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-widest flex items-center gap-2">
                       <button 
                         onClick={() => handleNameClick(item.user_id)}
                         className={`hover:text-[#777777] transition-colors ${item.user_id ? 'cursor-pointer underline decoration-[#CCC] underline-offset-4' : 'cursor-default'}`}
                         disabled={!item.user_id}
                       >
                         {item.name || "名無し"}
                       </button>
                       {item.status === 'read' && (
                         <span className="flex items-center gap-1 text-[10px] text-[#248A3D] font-normal border border-[#248A3D]/30 bg-[#248A3D]/5 px-2 py-0.5">
                           <CheckCircle2 size={10} /> 既読
                         </span>
                       )}
                       {item.status !== 'read' && (
                         <span className="text-[10px] text-white bg-[#E02424] px-2 py-0.5 font-normal tracking-widest">
                           未読
                         </span>
                       )}
                    </h3>
                    <div className="flex flex-col text-[10px] text-[#777777] mt-1 space-y-0.5 tracking-widest">
                       <span>{new Date(item.created_at).toLocaleString('ja-JP')}</span>
                       {item.email && <span>Email: {item.email}</span>}
                       {item.phone && <span>Tel: {item.phone}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#F9F9F9] p-4 text-xs text-[#333333] leading-relaxed tracking-widest whitespace-pre-wrap border border-[#E5E5E5] mb-4">
                   {item.content}
                </div>
                
                {item.status !== 'read' && (
                  <button 
                    onClick={() => handleMarkAsRead(item.id)}
                    className="flex justify-center items-center gap-2 w-full py-3 border border-black bg-white hover:bg-black hover:text-white transition-colors text-[11px] font-bold tracking-widest"
                  >
                    <Check size={14} className="stroke-[2]"/>
                    確認済みにする
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#777777]">
            <Inbox size={32} className="stroke-[1] mb-4 text-[#CCCCCC]" />
            <p className="text-xs tracking-widest">届いているご意見はありません</p>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-[#F9F9F9] rounded-full text-[#777777] hover:text-black transition-colors z-10"
            >
              <X size={18} />
            </button>
            <div className="p-6">
              <h2 className="text-sm font-bold tracking-widest text-center border-b border-[#E5E5E5] pb-4 mb-6">登録情報</h2>
              {isLoadingUser ? (
                 <div className="flex justify-center py-10">
                   <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : selectedUser ? (
                 <div className="space-y-5">
                   <div className="flex flex-col items-center gap-3">
                     <img src={selectedUser.avatar_url || '/images/default-avatar.png'} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-[#E5E5E5]" />
                     <div className="text-center">
                       <p className="text-sm font-bold tracking-widest">{selectedUser.name}</p>
                       <span className="text-[10px] text-[#777777] border border-[#E5E5E5] px-2 py-0.5 inline-block mt-1 bg-[#F9F9F9]">
                         {selectedUser.role === 'cast' ? 'キャスト' : 'お客様'}
                       </span>
                     </div>
                   </div>
                   <div className="bg-[#F9F9F9] p-4 text-xs space-y-3 tracking-widest leading-relaxed border border-[#E5E5E5]">
                      <div><span className="text-[10px] text-[#777777] block mb-0.5">電話番号</span>{selectedUser.phone || '未登録'}</div>
                      <div><span className="text-[10px] text-[#777777] block mb-0.5">自己紹介</span>
                         <p className="whitespace-pre-wrap">{selectedUser.bio || '未設定'}</p>
                      </div>
                      <div><span className="text-[10px] text-[#777777] block mb-0.5">登録日時</span>{new Date(selectedUser.created_at).toLocaleString('ja-JP')}</div>
                   </div>

                   {/* Password Reset Button */}
                   <div className="pt-2">
                     <button
                       onClick={handleResetPasswordClick}
                       disabled={isResetting}
                       className="w-full py-3 bg-[#FFF5F5] border border-[#E02424] text-[#E02424] text-[10px] font-bold tracking-widest hover:bg-[#E02424] hover:text-white transition-colors flex items-center justify-center gap-2"
                     >
                       {isResetting ? (
                         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         '⚠️ パスワードを「000000」に初期化する'
                       )}
                     </button>

                     <button
                       onClick={() => {
                         navigator.clipboard.writeText(`お問い合わせいただき、誠にありがとうございます。\n\nパスワードがご不明とのこと、承知いたしました。ご不便をおかけしております。\n運営事務局にて「仮パスワード」を発行いたしましたので、下記の情報でログインをお試しいただけますでしょうか。\n\n【仮パスワード】： 000000\n\nご登録の電話番号と上記の仮パスワードでログイン後、メニュー内の「アカウント設定」より、お客様ご自身で本パスワードへの変更をお願いいたします。\n\nその他、ご不明な点やご要望などがございましたら、いつでもお気軽にお申し付けください。\nよろしくお願い申し上げます。`);
                         setResultModal({ isOpen: true, type: 'success', message: 'リセット案内の定型文をコピーしました！' });
                       }}
                       className="w-full mt-2 py-3 bg-[#F9F9F9] border border-[#E5E5E5] text-[#333333] text-[10px] font-bold tracking-widest hover:bg-[#EEEEEE] transition-colors flex items-center justify-center gap-2"
                     >
                       <Copy size={16} className="stroke-[1.5]" />
                       リセット案内の定型文をコピー
                     </button>
                   </div>
                 </div>
              ) : (
                 <p className="text-center text-xs text-[#777777] py-10 tracking-widest">ユーザー情報が見つかりませんでした。</p>
              )}
            </div>
            <div className="bg-[#F9F9F9] p-4 border-t border-[#E5E5E5]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-white border border-black text-black py-3 text-[11px] font-bold tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {isConfirmResetOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] shadow-2xl relative overflow-hidden">
            <div className="p-6 text-center">
              <h2 className="text-sm font-bold tracking-widest text-[#E02424] mb-3 flex items-center justify-center gap-2">
                <CheckCircle2 size={18} className="stroke-[2]" />
                初期化の確認
              </h2>
              <p className="text-xs text-[#333333] leading-relaxed tracking-widest mb-2">
                「<strong>{selectedUser?.name || '名無し'}</strong>」のパスワードを<br/>「<strong>000000</strong>」に初期化しますか？
              </p>
              <p className="text-[10px] text-[#777777] mb-6">※この操作は元に戻せません</p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsConfirmResetOpen(false)}
                  className="flex-1 py-3 bg-[#F9F9F9] border border-[#E5E5E5] text-[#777777] text-[11px] font-bold tracking-widest hover:bg-[#EEEEEE] transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={executeResetPassword}
                  className="flex-1 py-3 bg-[#E02424] text-white text-[11px] font-bold tracking-widest shadow-md hover:bg-[#C81E1E] transition-colors"
                >
                  初期化する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm border border-[#E5E5E5] shadow-2xl relative overflow-hidden">
            <div className="p-6 text-center">
              <h2 className={`text-sm font-bold tracking-widest mb-4 flex items-center justify-center gap-2 ${resultModal.type === 'success' ? 'text-[#248A3D]' : 'text-[#E02424]'}`}>
                {resultModal.type === 'success' ? (
                   <><CheckCircle2 size={18} className="stroke-[2]" /> 完了</>
                ) : (
                   <><X size={18} className="stroke-[2]" /> エラー</>
                )}
              </h2>
              <p className="text-xs text-[#333333] leading-relaxed tracking-widest mb-6 whitespace-pre-wrap">
                {resultModal.message}
              </p>
              
              <button 
                onClick={() => setResultModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full py-3 bg-black text-white text-[11px] font-bold tracking-widest shadow-md hover:bg-[#333] transition-colors"
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
