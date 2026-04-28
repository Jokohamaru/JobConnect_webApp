"use client";

import CVTemplateCard, { CVTemplate } from "./CVTemplateCard";
import { FileSearch } from "lucide-react";

interface CVTemplateGridProps {
  templates: CVTemplate[];
}

export default function CVTemplateGrid({ templates }: CVTemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileSearch className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">Không tìm thấy mẫu CV nào</p>
        <p className="text-sm mt-1">Thử chọn bộ lọc khác nhé!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-16 max-w-6xl mx-auto">
      {templates.map((template) => (
        <CVTemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}