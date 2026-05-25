import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useCVReadOnly } from '@/components/cv-builder/CVReadOnlyContext';

interface EditableTextProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChangeText: (val: string) => void;
  className?: string;
}

export function EditableText({ value, onChangeText, className, ...props }: EditableTextProps) {
  const isReadOnly = useCVReadOnly();

  if (isReadOnly) {
    return (
      <span className={cn("px-2 py-0.5 inline-block break-words max-w-full font-inherit", className)} style={props.style}>
        {value}
      </span>
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      className={cn(
        "h-auto w-full px-2 py-1 bg-transparent border-transparent hover:border-dashed hover:border-gray-400 focus:border-solid focus:border-blue-500 focus:bg-white transition-colors shadow-none rounded-sm !ring-0",
        className
      )}
      {...props}
    />
  );
}
