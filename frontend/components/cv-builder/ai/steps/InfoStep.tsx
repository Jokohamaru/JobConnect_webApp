"use client";

import { Input } from "@/components/ui/input";
import { Monitor, Megaphone, Briefcase, Paintbrush, GraduationCap, DollarSign, Users, MoreHorizontal, LayoutGrid, Search, BarChart2, Sparkles } from "lucide-react";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import Image from "next/image";

interface InfoStepProps {
  data: any;
  onChange: (data: any) => void;
}

const INDUSTRIES = [
  { id: "it", name: "Công nghệ thông tin", icon: Monitor },
  { id: "marketing", name: "Marketing", icon: Megaphone },
  { id: "business", name: "Kinh doanh", icon: Briefcase },
  { id: "design", name: "Thiết kế", icon: Paintbrush },
  { id: "education", name: "Giáo dục", icon: GraduationCap },
  { id: "finance", name: "Tài chính", icon: DollarSign },
  { id: "hr", name: "Nhân sự", icon: Users },
  { id: "other", name: "Khác", icon: MoreHorizontal },
];

const LEVELS = [
  { id: "fresher", name: "Sinh viên / Fresher" },
  { id: "under_1", name: "Dưới 1 năm" },
  { id: "1_to_3", name: "1 - 3 năm" },
  { id: "3_to_5", name: "3 - 5 năm" },
  { id: "senior", name: "Senior" },
];

export function InfoStep({ data, onChange }: InfoStepProps) {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 md:p-12">
      <div className="space-y-10">
        {/* 1. Lĩnh vực */}
      <div className="space-y-4 relative">
        <h3 className="font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </span>
          1. Bạn đang quan tâm tới lĩnh vực nào?
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:ml-11">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => updateData("industry", ind.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                data.industry === ind.id ? "border-[#1877F2] bg-blue-50 text-[#1877F2]" : "border-gray-100 hover:border-gray-200 text-gray-500"
              }`}
            >
              <ind.icon className="w-6 h-6" />
              <span className="text-[11px] font-semibold text-center">{ind.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Vị trí ứng tuyển */}
      <div className="space-y-4 relative">
        <h3 className="font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </span>
          2. Bạn muốn ứng tuyển vị trí nào?
        </h3>
        <div className="md:ml-11">
          <Input 
            value={data.jobTitle || ""}
            onChange={(e) => updateData("jobTitle", e.target.value)}
            placeholder="VD: Frontend Developer, Nhân viên Marketing..." 
            className="h-12 bg-gray-50/50 border-gray-200" 
          />
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-gray-500">Gợi ý vị trí phổ biến:</span>
            {["Marketing Executive", "UI/UX Designer", "Sales", "Data Analyst"].map(s => (
              <button 
                key={s} 
                onClick={() => updateData("jobTitle", s)}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Level */}
      <div className="space-y-4 relative">
        <h3 className="font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </span>
          3. Bạn đang ở level nào?
        </h3>
        <div className="flex flex-wrap gap-3 md:ml-11">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => updateData("level", lvl.id)}
              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                data.level === lvl.id ? "border-[#1877F2] bg-blue-50 text-[#1877F2]" : "border-gray-100 text-gray-600 hover:border-gray-200"
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Template */}
      <div className="space-y-4 relative">
        <h3 className="font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </span>
          4. Bạn muốn CV theo phong cách nào?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:ml-11">
          {CV_TEMPLATES.map((tpl) => (
            <div 
              key={tpl.id}
              onClick={() => updateData("templateId", tpl.id)}
              className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                data.templateId === tpl.id ? "border-[#1877F2] bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="relative aspect-[1/1.4] w-full rounded-lg overflow-hidden border border-gray-100 mb-3 shadow-sm">
                <Image src={tpl.image} alt={tpl.name} fill className="object-cover" />
              </div>
              <p className="text-center text-sm font-semibold text-gray-800">{tpl.name}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
