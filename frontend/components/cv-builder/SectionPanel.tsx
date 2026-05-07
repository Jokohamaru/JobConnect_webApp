"use client";

import { useState, useCallback } from "react";
import {
  User, Briefcase, GraduationCap, Star, FolderOpen,
  Award, Heart, FileText, ChevronUp, ChevronDown, Eye, EyeOff
} from "lucide-react";

export type SectionKey =
  | "summary" | "experience" | "education" | "skills"
  | "projects" | "certificates" | "activities" | "awards" | "hobbies";

export interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: "summary",      label: "Mục tiêu nghề nghiệp", icon: FileText,      enabled: true },
  { key: "experience",   label: "Kinh nghiệm làm việc", icon: Briefcase,     enabled: true },
  { key: "education",    label: "Học vấn",               icon: GraduationCap, enabled: true },
  { key: "skills",       label: "Kỹ năng",               icon: Star,          enabled: true },
  { key: "projects",     label: "Dự án",                 icon: FolderOpen,    enabled: false },
  { key: "certificates", label: "Chứng chỉ",             icon: Award,         enabled: true },
  { key: "activities",   label: "Hoạt động ngoại khoá", icon: User,          enabled: false },
  { key: "awards",       label: "Giải thưởng",           icon: Award,         enabled: false },
  { key: "hobbies",      label: "Sở thích",              icon: Heart,         enabled: false },
];

interface SectionPanelProps {
  sections: SectionConfig[];
  onChange: (sections: SectionConfig[]) => void;
}

export function SectionPanel({ sections, onChange }: SectionPanelProps) {
  const toggle = (key: SectionKey) => {
    onChange(sections.map((s) => s.key === key ? { ...s, enabled: !s.enabled } : s));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Mục CV</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={section.key}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                section.enabled
                  ? "bg-blue-50 border-blue-100 text-blue-700"
                  : "bg-gray-50 border-gray-100 text-gray-400"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-xs font-medium truncate">{section.label}</span>

              <div className="flex items-center gap-1">
              
                <button
                  onClick={() => toggle(section.key)}
                  className="p-0.5 rounded hover:bg-white/70 transition-opacity ml-0.5"
                  title={section.enabled ? "Ẩn mục này" : "Hiện mục này"}
                >
                  {section.enabled
                    ? <Eye className="w-3.5 h-3.5" />
                    : <EyeOff className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { DEFAULT_SECTIONS };
