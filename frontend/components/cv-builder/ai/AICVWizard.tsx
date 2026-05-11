"use client";

import { useState } from "react";
import { InfoStep } from "./steps/InfoStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { EducationStep } from "./steps/EducationStep";
import { SkillStep } from "./steps/SkillStep";
import { GenerateStep } from "./steps/GenerateStep";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Star,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Thông tin" },
  { id: 2, label: "Học vấn" },
  { id: 3, label: "Kinh nghiệm" },
  { id: 4, label: "Kỹ năng" },
  { id: 5, label: "Hoàn thiện" },
];

// Interface cho experience input
export interface ExperienceInput {
  company: string;
  position: string;
  workType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string;
}

// Interface cho education input
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

// Interface cho certificate input
export interface CertificateInput {
  name: string;
  issuer: string;
  date: string;
}

// Interface cho toàn bộ formData của wizard
export interface WizardFormData {
  // Step 1
  industry: string;
  jobTitle: string;
  level: string;
  templateId: number;
  // Step 2
  experiences: ExperienceInput[];
  // Step 3
  educations: EducationInput[];
  // Step 4
  skills: string[];
  skillLevels: Record<string, string>;
  strengths: string[];
  certificates?: CertificateInput[];
}

const defaultFormData = (): WizardFormData => ({
  industry: "it",
  jobTitle: "",
  level: "fresher",
  templateId: 1,
  experiences: [],
  educations: [],
  skills: [],
  skillLevels: {},
  strengths: [],
  certificates: [],
});

export function AICVWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(defaultFormData());
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Ẩn nút Next ở bước 5 (GenerateStep tự xử lý)
  const showNextButton = currentStep < 5;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="text-center pt-16 pb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-sm mb-6">
          {currentStep === 1 && (
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-blue-100 rounded-2xl rotate-3" />
              <div className="absolute inset-0 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center text-[#1877F2] font-bold text-xl">
                CV
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#1877F2] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                AI
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="relative w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#1877F2]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
            </div>
          )}
          {currentStep === 3 && (
            <Briefcase className="w-12 h-12 text-[#1877F2]" />
          )}
          {currentStep === 4 && (
            <div className="relative w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-[#1877F2] fill-[#1877F2]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rotate-45" />
            </div>
          )}
          {currentStep === 5 && (
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#1877F2]" />
            </div>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {currentStep === 1 && "Tạo CV chuyên nghiệp với AI"}
          {currentStep === 2 && "Học vấn"}
          {currentStep === 3 && "Kinh nghiệm làm việc"}
          {currentStep === 4 && "Kỹ năng của bạn"}
          {currentStep === 5 && "Hoàn thiện & Tạo CV"}
        </h1>
        <p className="text-gray-500">
          {currentStep === 1 && (
            <>
              <span className="block">Trả lời một vài câu hỏi ngắn,</span>
              <span className="block">
                Job Connect sẽ gợi ý CV phù hợp với bạn.
              </span>
            </>
          )}
          {currentStep === 2 && (
            <>
              <span className="block">Thêm học vấn của bạn để Job Connect</span>
              <span className="block">hiểu rõ hơn về trình độ của bạn.</span>
            </>
          )}
          {currentStep === 3 && (
            <>
              <span className="block">
                Thêm kinh nghiệm của bạn để Job Connect
              </span>
              <span className="block">giúp tạo CV phù hợp hơn.</span>
            </>
          )}
          {currentStep === 4 && (
            <>
              <span className="block">Thêm các kỹ năng để Job Connect</span>
              <span className="block">gợi ý CV phù hợp và nổi bật hơn.</span>
            </>
          )}
          {currentStep === 5 && (
            <>
              <span className="block">Xem lại thông tin và để AI</span>
              <span className="block">tạo CV chuyên nghiệp cho bạn.</span>
            </>
          )}
        </p>
      </div>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200 z-0" />
          {/* Progress line */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#1877F2] z-0 transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div
                key={step.id}
                className="flex items-center gap-3 bg-[#F8FAFC] px-2 z-10 relative"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    isCompleted
                      ? "bg-[#1877F2] text-white"
                      : isActive
                        ? "bg-[#1877F2] text-white ring-4 ring-blue-100"
                        : "bg-white border-2 border-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={`text-sm font-semibold hidden md:block ${
                    isActive || isCompleted ? "text-[#1877F2]" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          {currentStep === 1 && (
            <InfoStep data={formData} onChange={setFormData} />
          )}
          {currentStep === 2 && (
            <EducationStep data={formData} onChange={setFormData} />
          )}
          {currentStep === 3 && (
            <ExperienceStep data={formData} onChange={setFormData} />
          )}
          {currentStep === 4 && (
            <SkillStep data={formData} onChange={setFormData} />
          )}
          {currentStep === 5 && <GenerateStep formData={formData} />}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between mt-10 bg-white p-6 rounded-2xl shadow-sm">
          <div className="w-1/3">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-600 font-semibold hover:bg-gray-100 h-12 px-6 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
              </Button>
            )}
          </div>
          <div className="w-1/3 text-center">
            <span className="text-sm text-gray-500 italic">
              {currentStep < 5
                ? "Bạn có thể bỏ qua bước này và bổ sung sau."
                : ""}
            </span>
          </div>
          <div className="w-1/3 flex justify-end">
            {showNextButton && (
              <Button
                onClick={handleNext}
                className="bg-[#1877F2] hover:bg-blue-700 text-white rounded-full px-12 h-14 text-base font-semibold shadow-lg shadow-blue-500/30"
              >
                Tiếp tục <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
