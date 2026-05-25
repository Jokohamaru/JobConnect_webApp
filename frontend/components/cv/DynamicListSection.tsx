import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { Plus, Trash2 } from 'lucide-react';
import { useCVReadOnly } from '@/components/cv-builder/CVReadOnlyContext';

interface DynamicListSectionProps<T> {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel?: string;
}

export function DynamicListSection<T extends { id: string }>({
  title,
  items = [],
  onAdd,
  onRemove,
  renderItem,
  addLabel,
}: DynamicListSectionProps<T>) {
  const isReadOnly = useCVReadOnly();

  return (
    <SectionWrapper title={title}>
      <div className="flex flex-col gap-1.5">
        {(items || []).map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative flex items-start gap-2 px-2 py-1.5 rounded-md transition-all duration-150",
              !isReadOnly 
                ? "group/item border border-transparent hover:border-dashed hover:border-blue-200 hover:bg-blue-50/20" 
                : "border-0 p-0"
            )}
          >
            {/* Content */}
            <div className="flex-1 min-w-0 w-full overflow-hidden">
              {renderItem(item, index)}
            </div>

            {/* Trash button — hiện khi hover, ẩn khi in */}
            {!isReadOnly && (
              <button
                onClick={() => onRemove(item.id)}
                title="Xóa mục này"
                className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover/item:opacity-100 print:hidden"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Add button */}
        {!isReadOnly && (
          <button
            onClick={onAdd}
            className="mt-1 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 rounded-md py-1.5 text-xs text-gray-400 hover:text-blue-500 transition-all print:hidden"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm {addLabel ?? title.toLowerCase()}
          </button>
        )}
      </div>
    </SectionWrapper>
  );
}

// Simple helper to avoid cn import errors if not already present
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
