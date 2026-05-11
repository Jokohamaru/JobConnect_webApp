"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Briefcase,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface GenerateStepProps {
  formData: {
    industry: string;
    jobTitle: string;
    level: string;
    templateId: number;
    experiences: any[];
    skills: string[];
    skillLevels: Record<string, string>;
    strengths: string[];
  };
}

const INDUSTRY_LABELS: Record<string, string> = {
  it: "Công nghệ thông tin",
  marketing: "Marketing",
  business: "Kinh doanh",
  design: "Thiết kế",
  education: "Giáo dục",
  finance: "Tài chính",
  hr: "Nhân sự",
  other: "Khác",
};

const LEVEL_LABELS: Record<string, string> = {
  fresher: "Sinh viên / Fresher",
  under_1: "Dưới 1 năm",
  "1_to_3": "1 - 3 năm",
  "3_to_5": "3 - 5 năm",
  senior: "Senior",
};

type GenerateStatus = "idle" | "loading" | "success" | "error";

export function GenerateStep({ formData }: GenerateStepProps) {
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const router = useRouter();
  const { token } = useAuth();

  const LOADING_MESSAGES = [
    "Đang phân tích thông tin của bạn...",
    "AI đang soạn nội dung chuyên nghiệp...",
    "Tối ưu hóa mô tả kinh nghiệm...",
    "Hoàn thiện CV của bạn...",
  ];

  const handleGenerate = async () => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    // Cycling loading messages
    let msgIdx = 0;
    setLoadingText(LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[msgIdx]);
    }, 2500);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/cvs/generate-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          industry: formData.industry,
          jobTitle: formData.jobTitle,
          level: formData.level,
          templateId: formData.templateId,
          experiences: formData.experiences,
          skills: formData.skills,
          skillLevels: formData.skillLevels,
          strengths: formData.strengths,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Có lỗi xảy ra khi tạo CV");
      }

      const cvData = await res.json();

      // Lưu vào sessionStorage rồi chuyển sang editor
      sessionStorage.setItem("ai-cv-data", JSON.stringify(cvData));
      setStatus("success");

      // Chờ 1s để user thấy success state, rồi redirect
      setTimeout(() => {
        router.push(
          `/cv-builder/${formData.templateId}?fromAI=true`
        );
      }, 1000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      clearInterval(msgInterval);
    }
  };

  // Summary items
  const summaryItems = [
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: "Vị trí",
      value: formData.jobTitle || "Chưa nhập",
      filled: !!formData.jobTitle,
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: "Ngành",
      value: INDUSTRY_LABELS[formData.industry] || formData.industry,
      filled: true,
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Cấp độ",
      value: LEVEL_LABELS[formData.level] || formData.level,
      filled: true,
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: "Kinh nghiệm",
      value:
        formData.experiences.length > 0
          ? `${formData.experiences.length} vị trí đã nhập`
          : "Chưa có (Fresher)",
      filled: formData.experiences.length > 0,
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: "Kỹ năng",
      value:
        formData.skills.length > 0
          ? `${formData.skills.length} kỹ năng`
          : "Chưa nhập",
      filled: formData.skills.length > 0,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#1877F2] to-blue-500 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-5 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Sẵn sàng tạo CV với AI!
          </h2>
          <p className="text-blue-100 text-sm">
            AI sẽ phân tích thông tin và tạo CV chuyên nghiệp cho bạn
          </p>
        </div>

        {/* Summary */}
        <div className="px-8 py-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Tóm tắt thông tin
          </h3>
          <div className="space-y-3">
            {summaryItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <span
                  className={`flex-shrink-0 ${
                    item.filled ? "text-[#1877F2]" : "text-gray-300"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-xs text-gray-500 w-20 shrink-0">
                  {item.label}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    item.filled ? "text-gray-800" : "text-gray-400 italic"
                  }`}
                >
                  {item.value}
                </span>
                {item.filled && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Skills preview */}
          {formData.skills.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-2">
                Kỹ năng của bạn:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.slice(0, 8).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 bg-white text-[#1877F2] text-xs font-medium rounded-lg border border-blue-200"
                  >
                    {s}
                  </span>
                ))}
                {formData.skills.length > 8 && (
                  <span className="px-2.5 py-1 text-gray-500 text-xs font-medium rounded-lg">
                    +{formData.skills.length - 8} kỹ năng khác
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {status === "error" && (
          <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Không thể tạo CV
              </p>
              <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="mx-8 mb-4 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-[#1877F2] animate-spin shrink-0" />
              <p className="text-sm font-semibold text-[#1877F2]">
                {loadingText}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-blue-100 rounded-full h-1.5">
              <div className="bg-[#1877F2] h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <div className="mx-8 mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-sm font-semibold text-green-700">
              CV đã tạo xong! Đang chuyển đến editor...
            </p>
          </div>
        )}

        {/* CTA Button */}
        <div className="px-8 pb-8">
          <Button
            onClick={handleGenerate}
            disabled={status === "loading" || status === "success"}
            className="w-full h-14 bg-gradient-to-r from-[#1877F2] to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI đang tạo CV...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Hoàn thành!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Tạo CV với AI
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Quá trình tạo thường mất 10-20 giây
          </p>
        </div>
      </div>
    </div>
  );
}
