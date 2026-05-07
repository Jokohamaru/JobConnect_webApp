import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Type } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CVHeaderProps {
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  onExportPDF: () => void;
}

export function CVHeader({ fontSize, setFontSize, onExportPDF }: CVHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center sticky top-0 z-50 print:hidden shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">CV Builder</h1>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-500" />
          <Select value={fontSize} onValueChange={(val: any) => setFontSize(val)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Cỡ chữ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Cỡ chữ nhỏ</SelectItem>
              <SelectItem value="medium">Cỡ chữ vừa</SelectItem>
              <SelectItem value="large">Cỡ chữ lớn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button onClick={onExportPDF} className="bg-green-600 hover:bg-green-700 text-white font-medium">
        <FileDown className="w-4 h-4 mr-2" />
        Tải xuống PDF
      </Button>
    </div>
  );
}
