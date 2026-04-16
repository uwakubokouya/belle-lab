"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ImagePlus, Sparkles, User as UserIcon } from "lucide-react";
import { useState } from 'react';
import { useUser } from '@/providers/UserProvider';
import { supabase } from '@/lib/supabase';

export default function PostCreationPage() {
    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [postType, setPostType] = useState<"全員" | "会員" | "フォロワー">("全員");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const { user } = useUser();
    const router = useRouter();

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
                  post_type: postType // Supposing post_type column is added
              } as any); // using any here just in case types are not up-to-date
              
          if (postError) throw new Error("投稿の保存に失敗しました: " + postError.message);
          
          router.push('/');
      } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || "エラーが発生しました");
          setIsPosting(false);
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
                    onClick={handleSubmit}
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

                {/* AI Assistant Button */}
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
        </div>
    );
}
