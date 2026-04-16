"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@/providers/UserProvider';

export default function MediaWatermark() {
  const { user } = useUser();
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    setGuestId("GUEST-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  }, []);

  // Avoid hydratation mismatch by not checking window immediately, but effect will run
  const identifier = user?.phone || user?.id.slice(0, 8) || guestId;

  if (!identifier) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden flex flex-wrap content-start select-none mix-blend-difference opacity-[0.12]" 
      style={{ gap: '1.5rem', paddingTop: '1rem', transform: 'rotate(-25deg) scale(1.8)' }}
    >
      {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="text-white font-bold text-[11px] whitespace-nowrap">
            {identifier}
          </div>
      ))}
    </div>
  );
}
