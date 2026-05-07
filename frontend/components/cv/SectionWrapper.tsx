import React from 'react';

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
}

export function SectionWrapper({ title, children }: SectionWrapperProps) {
  return (
    <div className="mb-6 relative group">
      <h3 className="text-lg font-bold uppercase  border-gray-800 pb-1 text-gray-800 tracking-wide select-none">
        {title}
      </h3>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
