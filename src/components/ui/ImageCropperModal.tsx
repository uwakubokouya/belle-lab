"use client";
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import { X, Crop as CropIcon, Loader2 } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectRatio?: number; // e.g. 1 (1:1), 16/9, 2 (2:1)
  onCropComplete: (file: File) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ImageCropperModal({
  imageSrc,
  aspectRatio = 1,
  onCropComplete,
  onCancel,
  isProcessing = false
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropCompleteFn = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedFile);
    } catch (e) {
      console.error(e);
      alert('画像の切り抜きに失敗しました');
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black text-white flex flex-col pt-12 pb-8 px-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onCancel} disabled={isCropping || isProcessing} className="p-2 disabled:opacity-50">
          <X size={24} />
        </button>
        <span className="text-sm font-bold tracking-widest text-[#E5E5E5]">位置を調整</span>
        <button 
          onClick={handleCrop} 
          disabled={isCropping || isProcessing}
          className="text-xs font-bold tracking-widest px-6 py-3 bg-white text-black rounded-none disabled:opacity-50"
        >
          {(isCropping || isProcessing) ? <Loader2 size={16} className="animate-spin mx-auto" /> : "完了"}
        </button>
      </div>

      {/* Cropper Container */}
      <div className="relative flex-1 w-full mt-4">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteFn}
          onZoomChange={setZoom}
          cropShape="rect"
          showGrid={false}
          style={{
            containerStyle: { background: 'black' },
            cropAreaStyle: { border: '1px solid white' }
          }}
        />
      </div>
      
      {/* Bottom Controls */}
      <div className="mt-8 flex flex-col items-center gap-6 text-[#777777] text-xs pb-4 z-10">
         <div className="flex items-center gap-2">
            <CropIcon size={16} />
            <span className="tracking-widest">ピンチイン・ドラッグで調整</span>
         </div>
         {/* Simple Zoom Slider */}
         <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-2/3 accent-white h-1 bg-[#333333] rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
