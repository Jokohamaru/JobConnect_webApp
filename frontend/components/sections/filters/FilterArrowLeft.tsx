
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FilterArrowsLeft() {
  return (
    <div className="flex items-center gap-2">
      <Button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors">
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </Button>
    </div>
  );
}