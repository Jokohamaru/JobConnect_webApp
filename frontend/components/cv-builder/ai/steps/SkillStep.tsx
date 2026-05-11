"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  ChevronDown,
  Check,
  Users,
  Lightbulb,
  Brain,
  Award,
  Headphones,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardFormData } from "../AICVWizard";

interface SkillStepProps {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
}

// Gợi ý kỹ năng theo ngành
const SUGGESTED_SKILLS_BY_INDUSTRY: Record<string, string[]> = {
  it: ["React", "Node.js", "TypeScript", "Python", "Docker", "SQL", "Git", "REST API", "Agile/Scrum"],
  marketing: ["SEO", "Google Analytics", "Content Writing", "Facebook Ads", "Email Marketing", "Canva", "Copywriting"],
  business: ["Đàm phán", "Phân tích thị trường", "CRM", "Excel", "Quản lý dự án", "Tư vấn khách hàng"],
  design: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "UI/UX Design", "Sketch", "Prototyping"],
  education: ["Soạn giáo án", "PowerPoint", "Quản lý lớp học", "Đánh giá học sinh", "Thiết kế chương trình"],
  finance: ["Excel", "Kế toán", "Phân tích tài chính", "Báo cáo tài chính", "Thuế", "MISA", "QuickBooks"],
  hr: ["Tuyển dụng", "Onboarding", "Đánh giá KPI", "Luật lao động", "Phỏng vấn", "HRIS"],
  other: ["Giao tiếp", "Giải quyết vấn đề", "Quản lý thời gian", "Làm việc nhóm", "Microsoft Office"],
};

const SKILL_LEVEL_OPTIONS = ["Cơ bản", "Khá", "Thành thạo"];

const STRENGTHS_LIST = [
  { name: "Làm việc nhóm", icon: Users },
  { name: "Sáng tạo", icon: Lightbulb },
  { name: "Tư duy phân tích", icon: Brain },
  { name: "Lãnh đạo", icon: Award },
  { name: "Chăm sóc khách hàng", icon: Headphones },
  { name: "Giải quyết vấn đề", icon: ShieldAlert },
];

export function SkillStep({ data, onChange }: SkillStepProps) {
  const [inputValue, setInputValue] = useState("");
  const [showMore, setShowMore] = useState(false);

  const suggestedSkills = SUGGESTED_SKILLS_BY_INDUSTRY[data.industry] || SUGGESTED_SKILLS_BY_INDUSTRY["other"];
  const displayedSuggested = showMore ? suggestedSkills : suggestedSkills.slice(0, 5);

  // ─── Skill helpers ─────────────────────────────────────────────────────────
  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (!s || data.skills.includes(s)) return;
    onChange({ ...data, skills: [...data.skills, s] });
  };

  const removeSkill = (skill: string) => {
    const updated = data.skills.filter((s) => s !== skill);
    // Cũng xóa khỏi skillLevels
    const updatedLevels = { ...data.skillLevels };
    delete updatedLevels[skill];
    onChange({ ...data, skills: updated, skillLevels: updatedLevels });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue.trim());
      setInputValue("");
    }
  };

  // ─── Skill level helpers ────────────────────────────────────────────────────
  const setSkillLevel = (skill: string, level: string) => {
    onChange({ ...data, skillLevels: { ...data.skillLevels, [skill]: level } });
  };

  // ─── Strengths helpers ──────────────────────────────────────────────────────
  const toggleStrength = (name: string) => {
    const updated = data.strengths.includes(name)
      ? data.strengths.filter((s) => s !== name)
      : [...data.strengths, name];
    onChange({ ...data, strengths: updated });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─ LEFT COLUMN ─ */}
      <div className="space-y-6">

        {/* 1. Nhập kỹ năng */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">1. Bạn có những kỹ năng nào?</h3>
          <div className="min-h-[120px] p-3 border border-gray-200 rounded-2xl flex flex-wrap gap-2 focus-within:border-[#1877F2] focus-within:ring-1 focus-within:ring-[#1877F2]/20 transition-all bg-white">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F5FF] text-[#1877F2] text-sm font-medium rounded-lg"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-blue-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Nhập kỹ năng và nhấn Enter..."
              className="flex-1 min-w-[200px] outline-none text-sm text-gray-700 bg-transparent py-1.5"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* 2. Gợi ý kỹ năng phù hợp */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-1">2. Gợi ý kỹ năng phù hợp</h3>
          <p className="text-xs text-gray-400 mb-4">Dựa trên ngành nghề và vị trí bạn đã chọn</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {displayedSuggested.map((skill) => {
              const isAdded = data.skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => (isAdded ? removeSkill(skill) : addSkill(skill))}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 border text-sm font-medium rounded-full transition-colors",
                    isAdded
                      ? "bg-[#1877F2] text-white border-[#1877F2]"
                      : "border-gray-200 text-gray-600 hover:border-[#1877F2] hover:text-[#1877F2]"
                  )}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {skill}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowMore((v) => !v)}
            className="text-[#1877F2] text-sm font-semibold flex items-center gap-1 hover:underline"
          >
            {showMore ? "Thu gọn" : "Xem thêm gợi ý"}
            <ChevronDown className={cn("w-4 h-4 transition-transform", showMore && "rotate-180")} />
          </button>
        </div>

        {/* 3. Kỹ năng theo nhóm — hiển thị nhanh */}
        {data.skills.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4">3. Kỹ năng đã thêm ({data.skills.length})</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─ RIGHT COLUMN ─ */}
      <div className="space-y-6">

        {/* 4. Tự đánh giá kỹ năng */}
        {data.skills.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-6">4. Bạn tự đánh giá kỹ năng của mình thế nào?</h3>
            <div className="space-y-4">
              {data.skills.map((skill) => (
                <div key={skill} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-0 truncate flex-1">{skill}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {SKILL_LEVEL_OPTIONS.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSkillLevel(skill, lvl)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border whitespace-nowrap",
                          data.skillLevels[skill] === lvl
                            ? "bg-[#1877F2] text-white border-[#1877F2]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1877F2] hover:text-[#1877F2]"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Điểm mạnh */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {data.skills.length > 0 ? "5." : "4."} Bạn muốn nhấn mạnh điểm mạnh nào?
          </h3>
          <div className="flex flex-wrap gap-3">
            {STRENGTHS_LIST.map((str) => {
              const Icon = str.icon;
              const isSelected = data.strengths.includes(str.name);
              return (
                <button
                  key={str.name}
                  onClick={() => toggleStrength(str.name)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors relative pr-8",
                    isSelected
                      ? "bg-[#F0F5FF] text-[#1877F2] border-[#1877F2]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#1877F2] hover:text-[#1877F2]"
                  )}
                >
                  <Icon className="w-4 h-4" /> {str.name}
                  {isSelected && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1877F2] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip box */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#1877F2] rounded-xl flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">Mẹo tạo CV nổi bật</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Thêm tối thiểu <strong>5-8 kỹ năng</strong> và đánh giá mức độ để AI tạo CV
                phù hợp nhất với vị trí bạn ứng tuyển.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
