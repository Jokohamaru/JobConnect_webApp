"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, ChevronDown, Upload, Check, Users, Lightbulb, Brain, Award, Headphones, ShieldAlert, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function SkillStep({ data, onChange }: SkillStepProps) {
  const [skills, setSkills] = useState<string[]>(["Giao tiếp", "Excel", "Phân tích dữ liệu", "Quản lý thời gian", "Làm việc nhóm"]);
  const [inputValue, setInputValue] = useState("");

  const suggestedSkills = ["Content Writing", "SEO", "Social Media", "Google Analytics", "Presentation"];

  const groupedSkills = {
    hard: ["Excel", "Photoshop", "Phân tích dữ liệu", "Marketing", "Google Analytics"],
    soft: ["Giao tiếp", "Làm việc nhóm", "Quản lý thời gian", "Giải quyết vấn đề"],
    lang: ["Tiếng Anh", "Tiếng Nhật"]
  };

  const skillLevels = [
    { name: "Excel", level: "Thành thạo" },
    { name: "Phân tích dữ liệu", level: "Khá" },
    { name: "Giao tiếp", level: "Thành thạo" },
    { name: "Quản lý thời gian", level: "Khá" },
    { name: "Tiếng Anh", level: "Khá" }
  ];

  const strengthsList = [
    { name: "Làm việc nhóm", icon: Users, selected: true },
    { name: "Sáng tạo", icon: Lightbulb, selected: false },
    { name: "Tư duy phân tích", icon: Brain, selected: true },
    { name: "Lãnh đạo", icon: Award, selected: false },
    { name: "Chăm sóc khách hàng", icon: Headphones, selected: true },
    { name: "Giải quyết vấn đề", icon: ShieldAlert, selected: true },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!skills.includes(inputValue.trim())) {
        setSkills([...skills, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        
        {/* 1. Bạn có những kỹ năng nào? */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">1. Bạn có những kỹ năng nào?</h3>
          <div className="min-h-[120px] p-3 border border-gray-200 rounded-2xl flex flex-wrap gap-2 focus-within:border-[#1877F2] focus-within:ring-1 focus-within:ring-[#1877F2]/20 transition-all bg-white">
            {skills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F5FF] text-[#1877F2] text-sm font-medium rounded-lg">
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
          <h3 className="text-base font-bold text-gray-900 mb-4">2. Gợi ý kỹ năng phù hợp</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedSkills.map(skill => (
              <button 
                key={skill} 
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-full hover:border-[#1877F2] hover:text-[#1877F2] transition-colors"
              >
                {skill} <Plus className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <button className="text-[#1877F2] text-sm font-semibold flex items-center gap-1 hover:underline">
            Xem thêm gợi ý <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Kỹ năng của bạn theo nhóm */}
        <div className="bg-white rounded-3xl px-6 py-13 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">3. Kỹ năng của bạn theo nhóm</h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Hard Skills */}
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
                  Kỹ năng chuyên môn
                </h4>
                <span className="text-xs font-bold text-gray-500 bg-white w-5 h-5 flex items-center justify-center rounded-full border border-gray-100 shadow-sm">{groupedSkills.hard.length}</span>
              </div>
              <ul className="space-y-3 mb-4">
                {groupedSkills.hard.map(s => (
                  <li key={s} className="flex items-center justify-between text-sm text-gray-600 group">
                    {s}
                    <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="text-[#1877F2] text-sm font-semibold flex items-center gap-1.5 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Thêm kỹ năng
              </button>
            </div>

            {/* Soft Skills */}
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Kỹ năng mềm
                </h4>
                <span className="text-xs font-bold text-gray-500 bg-white w-5 h-5 flex items-center justify-center rounded-full border border-gray-100 shadow-sm">{groupedSkills.soft.length}</span>
              </div>
              <ul className="space-y-3 mb-4">
                {groupedSkills.soft.map(s => (
                  <li key={s} className="flex items-center justify-between text-sm text-gray-600 group">
                    {s}
                    <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="text-green-600 text-sm font-semibold flex items-center gap-1.5 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Thêm kỹ năng
              </button>
            </div>

            {/* Languages */}
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Ngoại ngữ
                </h4>
                <span className="text-xs font-bold text-gray-500 bg-white w-5 h-5 flex items-center justify-center rounded-full border border-gray-100 shadow-sm">{groupedSkills.lang.length}</span>
              </div>
              <ul className="space-y-3 mb-4">
                {groupedSkills.lang.map(s => (
                  <li key={s} className="flex items-center justify-between text-sm text-gray-600 group">
                    {s}
                    <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button className="text-[#1877F2] text-sm font-semibold flex items-center gap-1.5 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Thêm kỹ năng
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        
        {/* 4. Đánh giá */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-6">4. Bạn tự đánh giá kỹ năng của mình thế nào?</h3>
          <div className="space-y-4">
            {skillLevels.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-1/3">{item.name}</span>
                <div className="flex gap-2 flex-1 justify-end">
                  {["Cơ bản", "Khá", "Thành thạo"].map(lvl => (
                    <button 
                      key={lvl}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                        item.level === lvl 
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

        {/* 5. Điểm mạnh */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">5. Bạn muốn nhấn mạnh điểm mạnh nào?</h3>
          <div className="flex flex-wrap gap-3">
            {strengthsList.map((str, idx) => {
              const Icon = str.icon;
              return (
                <button 
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors relative pr-8",
                    str.selected 
                      ? "bg-[#F0F5FF] text-[#1877F2] border-[#1877F2]" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#1877F2] hover:text-[#1877F2]"
                  )}
                >
                  <Icon className="w-4 h-4" /> {str.name}
                  {str.selected && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#1877F2] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 6. Upload CV */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">6. Tải CV cũ lên để gợi ý kỹ năng nhanh hơn (tùy chọn)</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-[#1877F2]" />
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1">Kéo & thả file CV của bạn vào đây</p>
            <p className="text-xs text-gray-500 mb-4">Hỗ trợ: PDF, DOCX (tối đa 5MB)</p>
            <Button variant="outline" className="text-[#1877F2] font-semibold border-blue-200 hover:bg-blue-50 rounded-full px-6">
              Chọn file từ máy
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
