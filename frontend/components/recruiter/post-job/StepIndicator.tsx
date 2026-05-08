"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  { id: 1, label: "Thông tin cơ bản" },
  { id: 2, label: "Mô tả công việc" },
  { id: 3, label: "Yêu cầu ứng viên" },
  { id: 4, label: "Xem trước & đăng tin" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-2xl">
      {steps.map((step, i) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  done
                    ? "bg-blue-600 border-blue-600 text-white"
                    : active
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap hidden sm:block",
                  active ? "text-blue-600" : done ? "text-blue-500" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 mt-[-14px] sm:mt-[-18px] transition-colors",
                  done ? "bg-blue-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
