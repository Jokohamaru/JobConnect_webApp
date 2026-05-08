"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

const BENEFIT_OPTIONS = [
  { id: "bhxh", label: "BHXH, BHYT", icon: "🏥" },
  { id: "bonus", label: "Thưởng KPI", icon: "🎯" },
  { id: "month13", label: "Thưởng tháng 13", icon: "🎁" },
  { id: "hybrid", label: "Hybrid Working", icon: "🏠" },
  { id: "laptop", label: "Laptop", icon: "💻" },
  { id: "annual_leave", label: "Du lịch hàng năm", icon: "✈️" },
  { id: "training", label: "Đào tạo & phát triển", icon: "📚" },
  { id: "teambuilding", label: "Teambuilding", icon: "🤝" },
  { id: "annual_bonus", label: "Nghỉ phép năm", icon: "🌴" },
  { id: "meal", label: "Phụ cấp ăn trưa", icon: "🍱" },
  { id: "parking", label: "Phụ cấp xe", icon: "🚗" },
  { id: "health", label: "Bảo hiểm sức khoẻ", icon: "💊" },
];

interface BenefitsSectionProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function BenefitsSection({ selected, onToggle }: BenefitsSectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Chọn các phúc lợi đề thu hút ứng viên.
      </p>

      <div className="flex flex-wrap gap-2">
        {BENEFIT_OPTIONS.map((b) => {
          const active = selected.includes(b.id);
          return (
            <Button
              key={b.id}
              onClick={() => onToggle(b.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              <span>{b.icon}</span>
              {b.label}
              {active && <Check className="h-3.5 w-3.5 text-blue-600 ml-0.5" />}
            </Button>
          );
        })}

        {/* Custom benefit */}
        <Button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Thêm phúc lợi khác
        </Button>
      </div>
    </div>
  );
}
