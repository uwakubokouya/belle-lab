"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AgeGuard({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(true); // Default true to avoid flash before effect
  const [isChecking, setIsChecking] = useState(true);
  const [showImageModal, setShowImageModal] = useState(true);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (verified !== 'true') {
      setIsVerified(false);
    }
    setIsChecking(false);
  }, []);

  const handleEnter = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVerified(true);
  };

  const handleExit = () => {
    window.location.href = 'https://google.com';
  };

  if (isChecking) {
    return <div className="min-h-screen bg-white" />; // Sleek transition
  }

  if (!isVerified) {
    return (
      <>
        <div className="fixed inset-0 z-[9999] bg-white text-black flex flex-col items-center justify-center pb-24 p-6 font-light overflow-y-auto">
          <div className="max-w-sm w-full text-center space-y-10">
            <img src="/images/logo.png" alt="HimeMatch" className="w-80 md:w-96 h-auto object-contain mx-auto mb-6" />
            
            <div className="space-y-4">
                <p className="text-[#E02424] font-medium tracking-widest text-sm border border-[#E02424] inline-block px-4 py-2">
                    18歳未満アクセス禁止
                </p>
                <p className="text-xs leading-loose tracking-widest text-[#555555]">
                    当サイトは18歳未満（高校生含む）の方、<br/>
                    および閲覧を禁止されている地域からの<br/>
                    アクセスは固くお断りいたします。<br/>
                    あなたは18歳以上ですか？
                </p>
            </div>

            <div className="flex flex-col gap-4 mt-12 w-full px-4">
                <button 
                  onClick={handleEnter}
                  className="w-full bg-black text-white py-4 text-xs tracking-widest font-bold tracking-[0.2em]"
                >
                  YES (18歳以上・入場する)
                </button>
                <button 
                  onClick={handleExit}
                  className="w-full bg-transparent border border-[#777777] text-[#777777] py-4 text-xs tracking-widest hover:bg-[#F9F9F9] transition-colors"
                >
                  NO (18歳未満・退出する)
                </button>
            </div>

            </div>
        </div>

        {/* -------------------- Image Modal -------------------- */}
        {showImageModal && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-6 right-6 z-[10001] bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
            
            {/* Modal Content (Image) */}
            <div className="relative w-full max-w-md max-h-[85vh] flex items-center justify-center">
              <img 
                src="/images/ba67d821-df64-461b-ba2a-ddb18cf11c70.png" 
                alt="Special Notice" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

      </>
    );
  }

  return <>{children}</>;
}
