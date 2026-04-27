"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@/providers/UserProvider';

export default function SecurityGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isBlurred, setIsBlurred] = useState(false);
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    // setGuestId("GUEST-" + Math.random().toString(36).substring(2, 10).toUpperCase());
    
    // Privacy blur feature temporarily disabled per user request
    // const handleBlur = () => setIsBlurred(true);
    // const handleFocus = () => setIsBlurred(false);
    // const handleVisibilityChange = () => {
    //   if (document.hidden) setIsBlurred(true);
    //   else setIsBlurred(false);
    // };

    // window.addEventListener('blur', handleBlur);
    // window.addEventListener('focus', handleFocus);
    // document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check
    // if (document.hidden || !document.hasFocus()) {
    //    setIsBlurred(true);
    // }

    return () => {
      // window.removeEventListener('blur', handleBlur);
      // window.removeEventListener('focus', handleFocus);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      {/* 1. App Switch Blur Overlay (Triggered on background/control center) */}
      {isBlurred && (
        <div className="fixed inset-0 z-[10000] backdrop-blur-3xl bg-white/40 flex items-center justify-center transition-all duration-100 pointer-events-none">
          <p className="text-black/30 font-bold tracking-[0.4em] text-xs uppercase bg-white/50 px-4 py-2 border border-black/10">
            Privacy Protected
          </p>
        </div>
      )}
      
      {/* 2. Global Watermark (Temporarily removed based on user request) */}
      
      {children}
    </>
  );
}
