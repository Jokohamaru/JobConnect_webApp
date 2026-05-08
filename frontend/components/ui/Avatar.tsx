"use client";

import { useState } from 'react';
import { getUserAvatar } from '@/utils/avatarHelper';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({ 
  src, 
  alt = 'User avatar', 
  size = 'md',
  className = '',
  fallbackIcon = true,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getUserAvatar(src);
  
  const handleError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {!imageError ? (
        <img
          src={avatarUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : fallbackIcon ? (
        <User className="w-1/2 h-1/2 text-gray-400" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
