"use client";

import {
  MapPin, Clock, Users, CalendarDays, DollarSign,
  Briefcase, Building2, ChevronRight, CheckCircle2,
  TrendingUp, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobPreviewPanelProps {
  data: {
    title: string;
    department: string;
    level: string;
    workType: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    headcount: number;
    deadline: string;
    description: string;
    skills: string[];
    experience: string;
    benefits: string[];
  };
  companyName?: string;
  companyType?: string;
  companySize?: string;
  companyLogo?: string | null;
}
// ── A. Xem trước tin tuyển dụng ──────────────────────────────────────────────
export function JobPreviewCard({ data, companyName, companyType, companySize, companyLogo }: JobPreviewPanelProps) {
  const hasTitle = !!data.title;
  const displayCompany = companyName || "Tên công ty";
  const displayMeta = [
    companyType,
    companySize ? `${companySize} nhân viên` : null,
  ].filter(Boolean).join(" • ") || "Thông tin công ty";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Cover */}
      <div className="h-20 bg-linear-to-r from-blue-500 to-blue-400 relative">
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
            {companyLogo ? (
              <img src={companyLogo} alt={displayCompany} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-blue-600" />
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 px-4 pb-4">
        <div className="text-xs text-gray-500 mb-0.5">{displayCompany}</div>
        <div className="text-[11px] text-gray-400 mb-3">{displayMeta}</div>

        <h3 className="font-bold text-gray-900 text-base mb-2">
          {hasTitle ? data.title : <span className="text-gray-300">Tên công việc...</span>}
        </h3>

        <Badge className="bg-green-100 text-green-700 border-green-200 text-[11px] mb-3">
          Đang tuyển
        </Badge>

        <div className="space-y-1.5 text-xs text-gray-500">
          {data.salaryMin && data.salaryMax && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              {data.salaryMin} – {data.salaryMax}
            </div>
          )}
          {data.workType && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              {data.workType}
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              {data.location}
            </div>
          )}
          {data.level && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              {data.level}{data.experience ? ` • ${data.experience}` : ""}
            </div>
          )}
          {data.deadline && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              Hạn nộp: {data.deadline}
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="link"
          className="mt-3 text-blue-600 p-0 h-auto text-xs gap-1"
        >
          Xem chi tiết <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ── B. Dự đoán từ AI ─────────────────────────────────────────────────────────
interface AIPredictionCardProps {
  score: number;
  data: {
    title: string;
    description: string;
    skills: string[];
    benefits: string[];
    experience: string;
  };
}

function getRatingLabel(score: number): string {
  if (score >= 80) return "Xuất sắc";
  if (score >= 60) return "Rất tốt";
  if (score >= 40) return "Khá tốt";
  return "Cần cải thiện";
}

function getCandidateEstimate(score: number): string {
  if (score >= 80) return "200 – 300 ứng viên";
  if (score >= 60) return "100 – 150 ứng viên";
  if (score >= 40) return "50 – 100 ứng viên";
  return "Dưới 50 ứng viên";
}

function computeTips(data: AIPredictionCardProps["data"]): string[] {
  const tips: string[] = [];
  if (!data.description || data.description.length < 100)
    tips.push("Viết mô tả công việc chi tiết hơn (tối thiểu 100 ký tự)");
  if (data.skills.length < 3)
    tips.push("Thêm ít nhất 3 kỹ năng yêu cầu");
  if (data.benefits.length < 2)
    tips.push("Bổ sung thêm phúc lợi để thu hút ứng viên");
  if (!data.experience)
    tips.push("Ghi rõ số năm kinh nghiệm yêu cầu");
  if (!data.title)
    tips.push("Điền tên vị trí tuyển dụng");
  return tips.slice(0, 3);
}

export function AIPredictionCard({ score, data }: AIPredictionCardProps) {
  const ratingLabel = getRatingLabel(score);
  const candidateEstimate = getCandidateEstimate(score);
  const tips = computeTips(data);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-800">Dự đoán từ AI</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Dự đoán hiệu quả tin tuyển dụng</p>

      {/* Score ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="#3b82f6" strokeWidth="8"
              strokeDasharray={`${(score / 100) * 201} 201`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-blue-600">{score}</span>
            <span className="text-[10px] text-gray-400">/100</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-gray-800 mb-0.5">{ratingLabel}</div>
          <div className="text-xs text-gray-500 leading-relaxed">
            Ước tính số ứng viên phù hợp:
          </div>
          <div className="text-base font-bold text-blue-600">{candidateEstimate}</div>
        </div>
      </div>

      <div className="text-xs font-semibold text-gray-500 mb-2">Gợi ý để tăng hiệu quả</div>
      <div className="space-y-1.5">
        {tips.length > 0 ? (
          tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-xs text-gray-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
              {tip}
            </div>
          ))
        ) : (
          <div className="flex items-start gap-2 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
            Tin tuyển dụng đã đầy đủ thông tin!
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="mt-4 w-full text-xs border-blue-200 text-blue-600 hover:bg-blue-50 gap-1"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        Xem phân tích chi tiết
      </Button>
    </div>
  );
}

// ── C. Checklist hoàn thiện ───────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { label: "Thông tin cơ bản", field: "basic" },
  { label: "Mô tả công việc", field: "description" },
  { label: "Yêu cầu ứng viên", field: "requirements" },
  { label: "Phúc lợi", field: "benefits" },
];

export function ChecklistCard({
  completed,
  totalScore,
}: {
  completed: string[];
  totalScore: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-800 mb-1">Checklist hoàn thiện</div>
      <p className="text-xs text-gray-400 mb-4">
        Hoàn thiện các thông tin để tăng hiệu quả đăng tin.
      </p>

      <div className="space-y-2 mb-4">
        {CHECKLIST_ITEMS.map((item) => {
          const done = completed.includes(item.field);
          return (
            <div key={item.field} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    done ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${done ? "text-green-600" : "text-gray-300"}`}
                  />
                </div>
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
              <span
                className={`text-[11px] font-medium ${
                  done ? "text-green-600" : "text-orange-500"
                }`}
              >
                {done ? "Đã hoàn thành" : "Chưa xong"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-500">Độ hấp dẫn tin tuyển dụng</span>
        <span className="text-[11px] font-bold text-blue-600">{totalScore}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
          style={{ width: `${totalScore}%` }}
        />
      </div>
    </div>
  );
}
