"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ImagePlus, Sparkles, User as UserIcon, Star } from "lucide-react";
import { useState, useEffect } from 'react';
import { useUser } from '@/providers/UserProvider';
import { supabase } from '@/lib/supabase';

export default function PostCreationPage() {
    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [postType, setPostType] = useState<"全員" | "会員" | "フォロワー">("全員");
    const [targetArea, setTargetArea] = useState<string>("");
    const [quotedReviewId, setQuotedReviewId] = useState<string | null>(null);
    const [quotedReview, setQuotedReview] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const quote = params.get('quote');
            if (quote) {
                setContent(quote);
            }
            const qId = params.get('quoted_review_id');
            if (qId) {
                setQuotedReviewId(qId);
                fetchQuotedReview(qId);
            }
        }
    }, []);

    const fetchQuotedReview = async (id: string) => {
        const { data } = await supabase
            .from('sns_reviews')
            .select(`
              id, rating, score, visited_date, content,
              sns_profiles!sns_reviews_reviewer_id_fkey(name, avatar_url, is_vip)
            `)
            .eq('id', id)
            .single();
        if (data) {
            setQuotedReview(data);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray].slice(0, 4)); // Max 4
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
      setErrorMessage("");
      if (!user) {
          setErrorMessage("ログインしてください");
          return;
      }
      if (!content.trim() && images.length === 0) return;
      
      setIsPosting(true);
      try {
          const uploadedUrls: string[] = [];
          
          // 1. Upload Images
          for (let i = 0; i < images.length; i++) {
              const file = images[i];
              const ext = file.name.split('.').pop();
              const fileName = `${user.id}-${Date.now()}-${i}.${ext}`;
              
              const { error: uploadError } = await supabase.storage
                  .from('post_images')
                  .upload(fileName, file);
                  
              if (uploadError) throw new Error("画像のアップロードに失敗しました: " + uploadError.message);
              
              const { data: { publicUrl } } = supabase.storage
                  .from('post_images')
                  .getPublicUrl(fileName);
                  
              uploadedUrls.push(publicUrl);
          }
          
          // 2. Insert into sns_posts
          const { error: postError } = await supabase
              .from('sns_posts')
              .insert({
                  cast_id: user.id,
                  content: content.trim(),
                  images: uploadedUrls,
                  post_type: postType,
                  target_area: targetArea || null,
                  quoted_review_id: quotedReviewId
              } as any); 
              
          if (postError) throw new Error("投稿の保存に失敗しました: " + postError.message);
          
          router.push('/');
      } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || "エラーが発生しました");
          setIsPosting(false);
      } finally {
          setShowConfirmModal(false);
      }
    };

    const handleAIGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setContent("本日出勤しております。\n\nお近くにお越しの際はぜひお立ち寄りくださいませ。\n皆様のご来店を心よりお待ち申し上げております。");
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white pb-20 font-light">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-black hover:text-[#777777] transition-colors">
                        <X size={24} className="stroke-[1.5]" />
                    </Link>
                    <span className="font-normal text-sm tracking-widest font-bold">新規投稿</span>
                </div>
                <button 
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isPosting || (!content.trim() && images.length === 0)}
                    className="premium-btn text-[11px] font-medium tracking-widest px-6 py-2 flex items-center justify-center disabled:opacity-50 disabled:bg-[#E5E5E5] disabled:text-[#777777] disabled:border-[#E5E5E5]"
                >
                    {isPosting ? "送信中..." : "投稿する"}
                </button>
            </header>

            <main className="p-6">
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-[11px] tracking-widest leading-relaxed">
                        {errorMessage}
                    </div>
                )}
                
                {/* Profile row */}
                <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 border border-black overflow-hidden p-0.5">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#F9F9F9] flex items-center justify-center text-[#CCC]">
                                <UserIcon size={20} className="stroke-[1]" />
                            </div>
                        )}
                    </div>
                    <span className="font-normal tracking-widest uppercase text-sm">{user?.name || "GUEST"}</span>
                </div>

                {/* Text Area */}
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="いまどうしてる？（出勤状況や挨拶などを入力）"
                    className="w-full bg-transparent text-black text-lg resize-none outline-none min-h-[150px] placeholder:text-[#E5E5E5] mb-6 font-light tracking-wide leading-relaxed"
                />

                {/* Quoted Review Preview */}
                {quotedReview && (
                    <div className="mb-6 border border-[#E5E5E5] bg-[#F9F9F9] p-4 relative">
                        <button 
                            onClick={() => { setQuotedReview(null); setQuotedReviewId(null); }}
                            className="absolute top-2 right-2 p-1 bg-white border border-[#E5E5E5] text-[#777777] hover:text-black hover:bg-[#F9F9F9] transition-colors"
                        >
                            <X size={12} className="stroke-[1.5]" />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 border border-[#E5E5E5] bg-white overflow-hidden">
                                 <img 
                                    src={quotedReview.sns_profiles?.avatar_url || "/images/no-photo.jpg"} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div>
                                 <p className="text-[10px] font-bold tracking-widest flex items-center gap-1">
                                    {quotedReview.sns_profiles?.name || "匿名ユーザー"}
                                    {quotedReview.sns_profiles?.is_vip && (
                                        <img src="/images/vip-crown.png" alt="VIP" className="h-3 object-contain ml-0.5" />
                                    )}
                                 </p>
                                 <p className="text-[9px] text-[#777777] tracking-widest mt-0.5">訪問日: {quotedReview.visited_date}</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                             {[1, 2, 3, 4, 5].map((s) => (
                               <Star key={s} size={10} className={s <= quotedReview.rating ? 'fill-black text-black' : 'fill-transparent text-[#E5E5E5]'} />
                             ))}
                             <span className="text-[10px] font-bold ml-1">{quotedReview.score}点</span>
                        </div>
                        <p className="text-[11px] text-[#333333] leading-relaxed line-clamp-3">
                            {quotedReview.content}
                        </p>
                    </div>
                )}

                {/* AI Assistant Button - Temporarily hidden */}
                {false && (
                <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="w-full mb-6 border border-black text-black p-4 flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-colors"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border border-[#777777] border-t-white rounded-full animate-spin"></div>
                            <span className="text-[11px] tracking-widest">生成中...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} className="stroke-[1.5]" />
                            <span className="text-[11px] font-bold tracking-widest">AIに「売れる文章」を考えてもらう</span>
                        </>
                    )}
                </button>
                )}

                {/* Post Type Selection */}
                <div className="mb-8">
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-3 block text-[#777777]">公開範囲</span>
                    <div className="flex gap-3">
                        {["全員", "会員", "フォロワー"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setPostType(type as "全員" | "会員" | "フォロワー")}
                                className={`flex-1 py-2 text-[11px] font-bold tracking-widest border transition-colors ${
                                    postType === type 
                                    ? "bg-black text-white border-black" 
                                    : "bg-transparent text-black border-[#E5E5E5] hover:border-black"
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target Area Selection (Admin Only) */}
                {(user?.role === 'system' || user?.role === 'admin') && (
                    <div className="mb-8">
                        <span className="text-[10px] font-bold tracking-widest uppercase mb-3 block text-[#777777]">投稿先エリア (運営専用)</span>
                        <select
                            value={targetArea}
                            onChange={(e) => setTargetArea(e.target.value)}
                            className="w-full bg-[#F9F9F9] border border-[#E5E5E5] p-3 text-[11px] font-bold tracking-widest outline-none focus:border-black transition-colors appearance-none"
                        >
                            <option value="">全国 (指定なし)</option>
                            <optgroup label="北海道・東北">
                                {["北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島"].map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                            <optgroup label="関東">
                                {["東京", "神奈川", "埼玉", "千葉", "茨城", "栃木", "群馬"].map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                            <optgroup label="中部">
                                {["愛知", "静岡", "岐阜", "三重", "新潟", "富山", "石川", "福井", "山梨", "長野"].map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                            <optgroup label="近畿">
                                {["大阪", "京都", "兵庫", "奈良", "滋賀", "和歌山"].map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                            <optgroup label="中国・四国">
                                {["広島", "岡山", "山口", "鳥取", "島根", "徳島", "香川", "愛媛", "高知"].map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                            <optgroup label="九州・沖縄">
                                {["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"].map(p => <option key={p} value={p}>{p}</option>)}
                            </optgroup>
                        </select>
                    </div>
                )}

                {/* Divider */}
                <div className="h-[1px] bg-[#E5E5E5] w-full mb-6"></div>

                {/* Media Upload Area */}
                <div className="flex flex-wrap gap-4">
                    {images.map((file, i) => (
                        <div key={i} className="relative w-24 h-24 border border-black p-0.5">
                            {file.type.startsWith('video/') ? (
                                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <button 
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-black/50 p-1 text-white hover:bg-black transition-colors backdrop-blur-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    
                    {images.length < 4 && (
                        <label className="w-24 h-24 border border-dashed border-[#777777] flex flex-col items-center justify-center text-[#777777] hover:border-black hover:text-black transition-colors bg-[#F9F9F9] cursor-pointer">
                            <ImagePlus size={20} className="mb-2 stroke-[1.5]" />
                            <span className="text-[10px] tracking-widest">画像/動画</span>
                            <input 
                                type="file" 
                                accept="image/*,video/*" 
                                multiple 
                                className="hidden" 
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>
            </main>

            {/* Bottom Keyboard Toolbar (Faux) */}
            <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 z-40 bg-white border-y border-[#E5E5E5] flex justify-between items-center">
                <div className="flex gap-4">
                    <button className="text-black hover:text-[#777777] transition-colors"><ImagePlus size={20} className="stroke-[1.5]" /></button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#777777]">
                    <span className="font-bold">{content.length}</span> 文字
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 border border-[#E5E5E5] flex flex-col items-center">
                        <h3 className="text-sm font-bold tracking-widest mb-4 uppercase">Confirm</h3>
                        <div className="w-full text-left mb-6 max-h-[50vh] overflow-y-auto">
                            <p className="text-xs text-[#333333] mb-4 text-center bg-[#F9F9F9] p-4 w-full">
                                以下の内容で投稿しますか？
                            </p>
                            
                            <div className="border border-[#E5E5E5] p-4">
                                {/* Profile mini preview */}
                                <div className="flex items-center gap-2 mb-3">
                                    <img src={user?.avatar_url || "/images/no-photo.jpg"} alt="Profile" className="w-6 h-6 object-cover border border-[#E5E5E5] rounded-full" />
                                    <span className="text-[10px] font-bold tracking-widest">{user?.name || "GUEST"}</span>
                                    <span className="text-[9px] text-[#777777] bg-[#F9F9F9] px-1.5 py-0.5 border border-[#E5E5E5]">
                                        {postType}
                                    </span>
                                </div>
                                
                                {/* Content */}
                                {content && (
                                    <p className="text-[11px] text-[#333333] whitespace-pre-wrap leading-relaxed mb-3">
                                        {content}
                                    </p>
                                )}
                                
                                {/* Images */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {images.map((file, i) => (
                                            file.type.startsWith('video/') ? (
                                                <video key={i} src={URL.createObjectURL(file)} className="w-full h-20 object-cover border border-[#E5E5E5]" muted />
                                            ) : (
                                                <img key={i} src={URL.createObjectURL(file)} alt="Preview" className="w-full h-20 object-cover border border-[#E5E5E5]" />
                                            )
                                        ))}
                                    </div>
                                )}
                                
                                {/* Quoted Review */}
                                {quotedReview && (
                                    <div className="border border-[#E5E5E5] bg-[#F9F9F9] p-3 mt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={quotedReview.sns_profiles?.avatar_url || "/images/no-photo.jpg"} alt="Reviewer" className="w-5 h-5 object-cover" />
                                            <span className="text-[9px] font-bold">{quotedReview.sns_profiles?.name || "匿名"}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={10} className={s <= quotedReview.rating ? 'fill-black text-black' : 'fill-transparent text-[#E5E5E5]'} />
                                            ))}
                                            <span className="text-[9px] font-bold">{quotedReview.score}点</span>
                                        </div>
                                        <p className="text-[10px] text-[#555] line-clamp-2 leading-relaxed">
                                            {quotedReview.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="w-full flex gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 bg-[#F9F9F9] border border-[#E5E5E5] text-xs tracking-widest text-[#777777] hover:bg-[#E5E5E5] transition-colors shadow-sm"
                            >
                                キャンセル
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isPosting}
                                className="flex-1 py-3 bg-black text-white text-xs font-bold tracking-widest hover:bg-[#333333] transition-colors shadow-sm"
                            >
                                {isPosting ? "送信中..." : "投稿する"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
