import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div 
      className={cn("relative group cursor-pointer overflow-hidden bg-gray-200 flex items-center justify-center", className)}
      onClick={() => fileInputRef.current?.click()}
    >
      {value ? (
        <img src={value} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-400 flex flex-col items-center">
          <Camera className="w-8 h-8 mb-1" />
          <span className="text-xs">Tải ảnh lên</span>
        </div>
      )}
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium print:hidden">
        <Camera className="w-6 h-6 mb-1" />
        <span>Thay ảnh</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
