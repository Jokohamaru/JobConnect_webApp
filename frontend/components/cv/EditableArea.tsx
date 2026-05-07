import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EditableAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value: string;
  onChangeText: (val: string) => void;
  className?: string;
}

export function EditableArea({ value, onChangeText, className, ...props }: EditableAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChangeText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      className={cn(
        "w-full px-2 py-1 bg-transparent border border-transparent hover:border-dashed hover:border-gray-400 focus:border-solid focus:border-blue-500 focus:bg-white transition-colors outline-none resize-none overflow-hidden rounded-sm text-sm",
        className
      )}
      rows={1}
      {...props}
    />
  );
}
