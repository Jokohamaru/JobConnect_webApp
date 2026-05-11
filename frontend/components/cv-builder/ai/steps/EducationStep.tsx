"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Award,
  BookOpen,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EducationInput {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  gpa: string;
  description: string;
}

interface EducationStepProps {
  data: any;
  onChange: (data: any) => void;
}

const emptyEducation = (): EducationInput => ({
  school: "",
  degree: "bachelor",
  major: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  gpa: "",
  description: "",
});

const DEGREE_OPTIONS = [
  { value: "highschool", label: "Trung học phổ thông" },
  { value: "diploma", label: "Trung cấp / Cao đẳng" },
  { value: "bachelor", label: "Đại học (Cử nhân)" },
  { value: "master", label: "Thạc sĩ" },
  { value: "phd", label: "Tiến sĩ" },
  { value: "other", label: "Khác" },
];

export function EducationStep({ data, onChange }: EducationStepProps) {
  const educations =
    data.educations?.length > 0 ? data.educations : [emptyEducation()];

  const initIfEmpty = () => {
    if (!data.educations || data.educations.length === 0) {
      onChange({ ...data, educations: [emptyEducation()] });
    }
  };

  const updateEducation = (
    idx: number,
    field: keyof EducationInput,
    value: any,
  ) => {
    const updated = [
      ...(data.educations?.length > 0 ? data.educations : [emptyEducation()]),
    ];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, educations: updated });
  };

  const addEducation = () => {
    onChange({ ...data, educations: [...educations, emptyEducation()] });
  };

  const removeEducation = (idx: number) => {
    const updated = educations.filter((_: any, i: number) => i !== idx);
    onChange({ ...data, educations: updated });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Forms */}
      <div className="lg:col-span-2 space-y-6">
        {educations.map((edu: EducationInput, idx: number) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {idx === 0
                  ? "Học vấn cao nhất hoặc gần nhất"
                  : `Học vấn ${idx + 1}`}
              </h3>
              {idx > 0 && (
                <button
                  onClick={() => removeEducation(idx)}
                  className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tên trường
                </label>
                <Input
                  placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                  className="h-11 bg-gray-50/50 border-gray-200"
                  value={edu.school}
                  onChange={(e) => {
                    initIfEmpty();
                    updateEducation(idx, "school", e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Bằng cấp
                </label>
                <Select
                  value={edu.degree}
                  onValueChange={(v) => updateEducation(idx, "degree", v)}
                >
                  <SelectTrigger className="h-11 px-3 w-full bg-gray-50/50 border-gray-200 text-gray-600 shadow-none font-normal">
                    <SelectValue placeholder="Chọn bằng cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Chuyên ngành
                </label>
                <Input
                  placeholder="Ví dụ: Công nghệ thông tin"
                  className="h-11 bg-gray-50/50 border-gray-200"
                  value={edu.major}
                  onChange={(e) =>
                    updateEducation(idx, "major", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  GPA / Điểm TB{" "}
                  <span className="text-gray-400 font-normal">(nếu có)</span>
                </label>
                <Input
                  placeholder="Ví dụ: 3.5/4.0 hoặc 8.5/10"
                  className="h-11 bg-gray-50/50 border-gray-200"
                  value={edu.gpa}
                  onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Thời gian bắt đầu
                </label>
                <div className="relative">
                  <Input
                    placeholder="MM/YYYY"
                    className="h-11 bg-gray-50/50 border-gray-200"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(idx, "startDate", e.target.value)
                    }
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Thời gian kết thúc
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="MM/YYYY"
                      className="h-11 bg-gray-50/50 border-gray-200 disabled:opacity-50"
                      value={edu.isCurrent ? "" : edu.endDate}
                      disabled={edu.isCurrent}
                      onChange={(e) =>
                        updateEducation(idx, "endDate", e.target.value)
                      }
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#1877F2] focus:ring-[#1877F2]"
                      checked={edu.isCurrent}
                      onChange={(e) =>
                        updateEducation(idx, "isCurrent", e.target.checked)
                      }
                    />
                    Đang học
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-5 space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                Mô tả thêm{" "}
                <span className="text-gray-400 font-normal">
                  (Thành tích, hoạt động, học bổng...)
                </span>
              </label>
              <Textarea
                placeholder="Ví dụ: Học bổng xuất sắc, Chủ tịch CLB Lập trình, Giải nhất cuộc thi..."
                className="min-h-[100px] bg-gray-50/50 border-gray-200 resize-none"
                value={edu.description}
                onChange={(e) =>
                  updateEducation(idx, "description", e.target.value)
                }
              />
              <div className="text-right text-xs text-gray-400">
                {edu.description.length}/500
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addEducation}
          className="w-full border-dashed border-gray-300 text-[#1877F2] hover:bg-blue-50/50 hover:text-blue-700 h-12 font-semibold rounded-2xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm học vấn khác
        </Button>
      </div>

      {/* Right Column: AI Suggestions & Timeline */}
      <div className="space-y-6">
        {/* AI Suggestions Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            Gợi ý từ AI <Sparkles className="w-4 h-4 text-[#1877F2]" />
          </h3>
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
            <div className="flex gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-[#1877F2] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Thêm thành tích học tập hoặc hoạt động ngoại khóa để CV nổi bật
                hơn.
              </p>
            </div>
            <div className="space-y-2">
              {[
                "Học bổng xuất sắc",
                "GPA: 3.8/4.0",
                "Giải nhất cuộc thi Hackathon",
                "Chủ tịch CLB Lập trình",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => {
                    const cur = educations[0];
                    const newDesc = cur.description
                      ? `${cur.description}\n${hint}`
                      : hint;
                    updateEducation(0, "description", newDesc);
                    if (!data.educations || data.educations.length === 0) {
                      onChange({
                        ...data,
                        educations: [
                          { ...emptyEducation(), description: hint },
                        ],
                      });
                    }
                  }}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-medium text-[#1877F2] border border-blue-100 hover:bg-blue-50 transition-colors"
                >
                  + {hint}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-5">
            Hành trình học vấn
          </h3>
          {educations.filter((e: EducationInput) => e.school || e.major)
            .length > 0 ? (
            <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
              {educations
                .filter((e: EducationInput) => e.school || e.major)
                .map((edu: EducationInput, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="absolute left-[-16px] w-3 h-3 bg-[#1877F2] rounded-full border-4 border-white box-content shadow-sm z-10" />
                    <div className="bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10">
                      <GraduationCap className="w-4 h-4 text-[#1877F2]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {edu.school || "Tên trường"}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {DEGREE_OPTIONS.find((d) => d.value === edu.degree)
                          ?.label || "Bằng cấp"}{" "}
                        - {edu.major || "Chuyên ngành"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {edu.startDate || "??/????"}
                        {" - "}
                        {edu.isCurrent ? "Hiện tại" : edu.endDate || "??/????"}
                      </p>
                      {edu.gpa && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold">
                          <Award className="w-3 h-3" /> GPA: {edu.gpa}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 italic py-4">
              Hành trình học vấn của bạn sẽ được cập nhật tại đây
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
