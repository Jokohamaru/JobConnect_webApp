"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Cloud, Eye, Send, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { jobService } from "@/services/jobService";

import { StepIndicator } from "@/components/recruiter/post-job/StepIndicator";
import { BasicInfoSection } from "@/components/recruiter/post-job/BasicInfoSection";
import { JobDescriptionSection } from "@/components/recruiter/post-job/JobDescriptionSection";
import { RequirementsSection } from "@/components/recruiter/post-job/RequirementsSection";
import { BenefitsSection } from "@/components/recruiter/post-job/BenefitsSection";
import {
  JobPreviewCard,
  AIPredictionCard,
  ChecklistCard,
} from "@/components/recruiter/post-job/SidePanels";

// ─── Form section wrapper ──────────────────────────────────────────────────────
function FormSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <Button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-7 hover:bg-gray-50 transition-colors",
          open ? "rounded-t-xl rounded-b-none border-b-0" : "rounded-xl"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </Button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PostJobPage() {
  const [currentStep] = useState(1);
  const { user, token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic info
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    department: "",
    level: "",
    workType: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    headcount: 1,
    deadline: "",
  });

  const [description, setDescription] = useState("");

  const [requirements, setRequirements] = useState({
    skills: [] as string[],
    experience: "",
    technologies: [] as string[],
    education: "",
    languages: [] as string[],
  });

  const [benefits, setBenefits] = useState<string[]>([]);

  // Computed checklist
  const completed = useMemo(() => {
    const c: string[] = [];
    if (basicInfo.title && basicInfo.department && basicInfo.level) c.push("basic");
    if (description.length > 30) c.push("description");
    if (requirements.skills.length > 0 && requirements.experience) c.push("requirements");
    if (benefits.length > 0) c.push("benefits");
    return c;
  }, [basicInfo, description, requirements, benefits]);

  const totalScore = Math.min(95, completed.length * 20 + 15);

  const handleBasicChange = (field: string, value: string | number) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequirementsChange = (field: string, value: string | string[]) => {
    setRequirements((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBenefit = (id: string) => {
    setBenefits((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!basicInfo.title || !basicInfo.location || !description) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        setIsSubmitting(false);
        return;
      }

      // Get token
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        setIsSubmitting(false);
        return;
      }

      // Fetch cities to get city ID
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const citiesResponse = await fetch(`${API_URL}/cities`);
      const cities = await citiesResponse.json();
      
      // Find city by name
      const city = cities.find((c: any) => c.name === basicInfo.location);
      if (!city) {
        setError(`Không tìm thấy thành phố: ${basicInfo.location}`);
        setIsSubmitting(false);
        return;
      }

      // Parse salary
      const minSalary = basicInfo.salaryMin ? parseInt(basicInfo.salaryMin.replace(/,/g, '')) : undefined;
      const maxSalary = basicInfo.salaryMax ? parseInt(basicInfo.salaryMax.replace(/,/g, '')) : undefined;

      // Create job
      const jobData = {
        title: basicInfo.title,
        description: description,
        headcount: basicInfo.headcount,
        minSalary,
        maxSalary,
        currency: 'VND' as const,
        cityId: city.id,
        // For now, we'll skip tags and skills - you can add them later
        // tagIds: benefits,
        // skillIds: requirements.skills,
      };

      const newJob = await jobService.createJob(jobData, token);

      // Success - redirect to dashboard
      alert('Đăng tin tuyển dụng thành công!');
      router.push('/recruiter/dashboard');
    } catch (err: any) {
      console.error('Failed to create job:', err);
      setError(err.message || 'Có lỗi xảy ra khi đăng tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f5fb] flex flex-col">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 mx-4 py-4 rounded-xl ">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Đăng tin tuyển dụng mới</h1>
              <p className="text-sm text-gray-500">
                Tạo bài tuyển dụng chuyên nghiệp để tiếp cận ứng viên phù hợp.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Cloud className="h-3.5 w-3.5 text-green-500" />
              Đã lưu 2 phút trước
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT: Form sections */}
          <div className="space-y-4">
            {/* 1. Thông tin cơ bản */}
            <FormSection icon="📋" title="Thông tin cơ bản">
              <div className="pt-4">
                <p className="text-xs text-gray-400 mb-4">
                  Nhập các thông tin chính cho vị trí tuyển dụng.
                </p>
                <BasicInfoSection data={basicInfo} onChange={handleBasicChange} />
              </div>
            </FormSection>

            {/* 2. Mô tả công việc */}
            <FormSection icon="📝" title="Mô tả công việc">
              <div className="pt-4">
                <JobDescriptionSection
                  description={description}
                  onChange={setDescription}
                />
              </div>
            </FormSection>

            {/* 3. Yêu cầu ứng viên */}
            <FormSection icon="✅" title="Yêu cầu ứng viên">
              <div className="pt-4">
                <RequirementsSection
                  data={requirements}
                  onChange={handleRequirementsChange}
                />
              </div>
            </FormSection>

            {/* 4. Phúc lợi */}
            <FormSection icon="🎁" title="Phúc lợi">
              <div className="pt-4">
                <BenefitsSection selected={benefits} onToggle={toggleBenefit} />
              </div>
            </FormSection>
          </div>

          {/* RIGHT: Preview panels */}
          <div className="space-y-4 sticky top-[140px]">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                A. Xem trước tin tuyển dụng
              </div>
              <JobPreviewCard
                data={{
                  ...basicInfo,
                  description,
                  skills: requirements.skills,
                  experience: requirements.experience,
                  benefits,
                }}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                B. Dự đoán từ AI
              </div>
              <AIPredictionCard score={totalScore} />
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                C. Checklist hoàn thiện
              </div>
              <ChecklistCard completed={completed} totalScore={totalScore} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Error message */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-gray-700 gap-1.5 text-sm"
                onClick={() => router.push('/recruiter/dashboard')}
              >
                <X className="h-4 w-4" />
                Thoát
              </Button>
              <span className="text-xs text-gray-400 hidden sm:block">
                • Tự động lưu lần nhập
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 text-sm gap-1.5"
                disabled={isSubmitting}
              >
                <Cloud className="h-4 w-4" />
                Lưu nháp
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 text-sm gap-1.5"
                disabled={isSubmitting}
              >
                <Eye className="h-4 w-4" />
                Xem trước
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm gap-1.5 shadow-md shadow-blue-200"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Đang xử lý...' : 'Đăng tuyển ngay'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
