"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { applicationService } from "@/services/applicationService";
import { CVDocument } from "@/components/cv-builder/CVDocument";
import { CVReadOnlyContext } from "@/components/cv-builder/CVReadOnlyContext";
import { COLOR_THEMES, FONT_FAMILIES } from "@/components/cv-builder/DesignPanel";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  FileDown,
  Brain,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const resolveAvatarUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const getMockApplication = (idStr: string) => {
  const id = Number(idStr) || 1;
  const mockCandidates = [
    {
      id: 1, jobId: 1,
      name: "Nguyễn Văn A", role: "Frontend Developer", experience: "3 năm kinh nghiệm",
      skills: ["React", "JavaScript", "UI/UX"], avatar: "https://i.pravatar.cc/80?img=1",
      matchScore: 85, matchLevel: "Phù hợp cao",
      summary: "Kinh nghiệm phát triển các ứng dụng web với React, TypeScript và kiến trúc component.",
      workHistory: [{ company: "Frontend tại TechCorp", period: "01/2023 – Hiện tại" }],
      education: "Đại học Bách Khoa Hà Nội – Khoa CNTT",
      skillScores: [{ name: "React", score: 90 }, { name: "TypeScript", score: 85 }, { name: "UI/UX", score: 80 }],
      status: "reviewing",
    },
    {
      id: 2, jobId: 1,
      name: "Lê Văn H", role: "Frontend Developer", experience: "3 năm kinh nghiệm",
      skills: ["React", "TypeScript", "UI/UX"], avatar: "https://i.pravatar.cc/80?img=3",
      matchScore: 85, matchLevel: "Phù hợp cao",
      summary: "Kinh nghiệm phát triển các ứng dụng web với React, TypeScript và kiến trúc component.",
      workHistory: [{ company: "Frontend tại TechCorp", period: "01/2023 – Hiện tại" }],
      education: "Đại học Bách Khoa Hà Nội – Khoa CNTT",
      skillScores: [{ name: "React", score: 90 }, { name: "TypeScript", score: 85 }, { name: "UI/UX", score: 80 }],
      status: "matched",
    },
    {
      id: 3, jobId: 3,
      name: "Phạm Thị K", role: "UI/UX Designer", experience: "2 năm kinh nghiệm",
      skills: ["Figma", "UI/UX", "Adobe XD"], avatar: "https://i.pravatar.cc/80?img=5",
      matchScore: 80, matchLevel: "Phù hợp trung bình",
      summary: "Thiết kế UI/UX chuyên nghiệp với Figma và Adobe XD, có kinh nghiệm làm việc agile.",
      workHistory: [{ company: "UI Designer tại DesignHub", period: "06/2022 – Hiện tại" }],
      education: "Đại học Kiến trúc Hà Nội – Thiết kế đồ họa",
      skillScores: [{ name: "Figma", score: 92 }, { name: "Adobe XD", score: 85 }, { name: "UI/UX", score: 88 }],
      status: "matched",
    },
    {
      id: 4, jobId: 2,
      name: "Trần Văn L", role: "Backend Developer", experience: "3 năm kinh nghiệm",
      skills: ["NestJS", "Node.js", "PostgreSQL"], avatar: "https://i.pravatar.cc/80?img=7",
      matchScore: 73, matchLevel: "Phù hợp trung bình",
      summary: "Xây dựng REST API với NestJS, quản lý database PostgreSQL và tối ưu hiệu năng.",
      workHistory: [{ company: "Backend tại CloudBase", period: "03/2021 – Hiện tại" }],
      education: "Học viện Công nghệ Bưu chính Viễn thông",
      skillScores: [{ name: "NestJS", score: 88 }, { name: "Node.js", score: 82 }, { name: "PostgreSQL", score: 79 }],
      status: "reviewing",
    },
    {
      id: 5, jobId: 2,
      name: "Đặng Văn M", role: "Backend Developer", experience: "2 năm kinh nghiệm",
      skills: ["NestJS", "TypeScript", "MySQL"], avatar: "https://i.pravatar.cc/80?img=8",
      matchScore: 45, matchLevel: "Phù hợp thấp",
      summary: "Phát triển backend với NestJS và TypeScript, tích hợp các service bên thứ ba.",
      workHistory: [{ company: "Backend tại DataCo", period: "08/2022 – Hiện tại" }],
      education: "Đại học Kinh tế Quốc dân – CNTT",
      skillScores: [{ name: "NestJS", score: 88 }, { name: "TypeScript", score: 75 }, { name: "MySQL", score: 80 }],
      status: "contacted",
    },
    {
      id: 6, jobId: 3,
      name: "Hoàng Thị N", role: "UI/UX Designer", experience: "2 năm kinh nghiệm",
      skills: ["Figma", "Sketch", "Prototyping"], avatar: "https://i.pravatar.cc/80?img=9",
      matchScore: 35, matchLevel: "Phù hợp thấp",
      summary: "Thiết kế UI/UX với Figma và Sketch, có kinh nghiệm nghiên cứu người dùng.",
      workHistory: [{ company: "Designer tại BizSolutions", period: "02/2023 – Hiện tại" }],
      education: "Đại học Ngoại Thương – Truyền thông đa phương tiện",
      skillScores: [{ name: "Figma", score: 85 }, { name: "Sketch", score: 90 }, { name: "Prototyping", score: 70 }],
      status: "rejected",
    }
  ];

  const cand = mockCandidates.find(c => c.id === id) || mockCandidates[0];
  const nameParts = cand.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Generate full mock CVBuilder data
  const mockCvData = {
    avatar: cand.avatar,
    fullName: cand.name,
    jobTitle: cand.role,
    email: `${cand.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/ /g, "")}@gmail.com`,
    phone: "0987 654 321",
    address: "Hà Nội, Việt Nam",
    linkedin: `linkedin.com/in/${cand.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/ /g, "")}`,
    website: "",
    dob: "01/01/2000",
    summary: cand.summary,
    experiences: [
      {
        id: "exp1",
        position: cand.role,
        company: cand.workHistory[0]?.company?.split(' tại ')[1] || "Công ty Công nghệ",
        duration: cand.workHistory[0]?.period || "2023 - Hiện tại",
        description: "• Phát triển các sản phẩm công nghệ chất lượng cao\n• Phối hợp làm việc nhóm hiệu quả theo mô hình Agile\n• Áp dụng các công nghệ hiện đại tối ưu hiệu suất ứng dụng"
      }
    ],
    education: [
      {
        id: "edu1",
        degree: "Cử nhân",
        school: cand.education.split(' – ')[0] || "Trường Đại học",
        major: cand.education.split(' – ')[1] || "Công nghệ Thông tin",
        year: "2018 - 2022",
        gpa: "GPA: 3.5/4.0",
        description: ""
      }
    ],
    skills: cand.skills.map((s, idx) => ({ id: `skill${idx}`, skill: s, level: 4 })),
    projects: [
      {
        id: "proj1",
        name: `Dự án Cá nhân - ${cand.role}`,
        tech: cand.skills.join(', '),
        description: "Xây dựng ứng dụng hoàn chỉnh đáp ứng nhu cầu thực tế của người dùng, tối ưu hóa code và triển khai lên hạ tầng cloud.",
        link: "github.com/example/project"
      }
    ],
    certificates: [
      {
        id: "cert1",
        name: `Chứng chỉ Chuyên môn ${cand.role}`,
        issuer: "Coursera / Udemy",
        year: "2023"
      }
    ],
    activities: [],
    awards: [],
    hobbies: "Đọc sách công nghệ, học hỏi kiến thức mới, tham gia đóng góp mã nguồn mở.",
    templateId: 2,
    colorIndex: 0,
    fontSize: "medium",
    layout: "two-column",
    sections: [
      { key: "summary", enabled: true },
      { key: "experience", enabled: true },
      { key: "education", enabled: true },
      { key: "skills", enabled: true },
      { key: "projects", enabled: true },
      { key: "certificates", enabled: true },
      { key: "hobbies", enabled: true }
    ]
  };

  return {
    id: cand.id.toString(),
    matchScore: cand.matchScore,
    matchLevel: cand.matchLevel === "Phù hợp cao" ? "HIGH" : cand.matchLevel === "Phù hợp trung bình" ? "MEDIUM" : "LOW",
    aiFeedback: `Ứng viên ${cand.name} có sự tương đồng xuất sắc với vị trí ứng tuyển. Các kỹ năng cốt lõi như ${cand.skills.join(', ')} đáp ứng chính xác yêu cầu của tin đăng. Phần tóm tắt kinh nghiệm làm việc tại các đơn vị trước đây thể hiện năng lực chuyên môn vững vàng, khả năng thích ứng tốt và tư duy giải quyết vấn đề xuất sắc. Khuyến nghị mời phỏng vấn trực tiếp để đánh giá thêm về mức độ hòa nhập văn hóa doanh nghiệp.`,
    appliedAt: new Date().toISOString(),
    cv: {
      id: `cv_${cand.id}`,
      title: `CV - ${cand.name}`,
      cvUrl: "",
      cvType: "BUILDER",
      cvData: mockCvData,
      createdAt: new Date().toISOString(),
      candidate: {
        id: `cand_${cand.id}`,
        user: {
          firstName,
          lastName,
          email: `${cand.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/ /g, "")}@gmail.com`,
          avaUrl: cand.avatar,
          phone: "0987 654 321"
        }
      }
    },
    job: {
      id: cand.jobId.toString(),
      title: cand.role
    }
  };
};

export default function RecruiterCVViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  
  const applicationId = params?.applicationId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<any>(null);
  const [zoom, setZoom] = useState(85);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isAuthenticated && token && applicationId) {
      fetchApplicationDetails();
    }
  }, [isAuthenticated, authLoading, token, applicationId, router]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if it is a mock ID (simple numbers like 1, 2, 3, etc.)
      if (applicationId && !isNaN(Number(applicationId))) {
        const mockApp = getMockApplication(applicationId);
        setApplication(mockApp);
        setLoading(false);
        return;
      }

      const data = await applicationService.getApplicationById(applicationId, token!);
      setApplication(data);
    } catch (err: any) {
      console.error("Error fetching application details:", err);
      // Extra safety: fallback to mock if the fetched ID is mock-like or if fetch failed
      if (applicationId && (!isNaN(Number(applicationId)) || applicationId.length < 5)) {
        const mockApp = getMockApplication(applicationId || "1");
        setApplication(mockApp);
      } else {
        setError(err.message || "Không thể tải thông tin hồ sơ ứng tuyển.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-550/10">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500 font-semibold text-sm">Đang tải thông tin hồ sơ ứng viên...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-sm text-gray-500 mb-6">{error || "Không tìm thấy hồ sơ ứng tuyển"}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            Quay lại trang trước
          </button>
        </div>
      </div>
    );
  }

  const { cv, job } = application;
  const candidateUser = cv?.candidate?.user;
  const candidateName = candidateUser 
    ? `${candidateUser.firstName || ""} ${candidateUser.lastName || ""}`.trim() 
    : "Ứng viên ẩn danh";

  // Parse CV Builder Data
  let cvData = null;
  let templateId = 1;
  let colorIndex = 0;
  let fontFamily = FONT_FAMILIES[0].value;
  let fontSize: "small" | "medium" | "large" = "medium";
  let layout: "two-column" | "one-column" = "two-column";
  let enabledSections: any[] = [];

  if (cv.cvType === "BUILDER" && cv.cvData) {
    try {
      const rawData = typeof cv.cvData === "string" ? JSON.parse(cv.cvData) : cv.cvData;
      
      const fallbackName = (!rawData.fullName || rawData.fullName === "Ho va Ten" || rawData.fullName.trim() === "")
        ? candidateName
        : rawData.fullName;
        
      const fallbackJobTitle = (!rawData.jobTitle || rawData.jobTitle === "Vi tri ung tuyen" || rawData.jobTitle === "Vị trí ứng tuyển" || rawData.jobTitle.trim() === "")
        ? (job?.title || cv?.candidate?.careerRole || "Ứng viên")
        : rawData.jobTitle;

      cvData = {
        ...rawData,
        fullName: fallbackName,
        jobTitle: fallbackJobTitle,
        email: rawData.email || candidateUser?.email || "",
        phone: rawData.phone || candidateUser?.phone || cv?.candidate?.phoneNumber || "",
        address: rawData.address || cv?.candidate?.address || "",
        dob: rawData.dob || cv?.candidate?.dob || "",
        avatar: resolveAvatarUrl(rawData.avatar || candidateUser?.avaUrl)
      };
      
      templateId = rawData.templateId || 1;
      colorIndex = rawData.colorIndex !== undefined ? rawData.colorIndex : 0;
      fontFamily = rawData.fontFamily || FONT_FAMILIES[0].value;
      fontSize = rawData.fontSize || "medium";
      layout = rawData.layout || "two-column";

      if (rawData.sections) {
        enabledSections = rawData.sections
          .filter((s: any) => s.enabled)
          .map((s: any) => s.key);
      } else {
        enabledSections = [
          "summary", "experience", "education", "skills", "projects",
          "certificates", "activities", "awards", "hobbies"
        ];
      }
    } catch (e) {
      console.error("Failed to parse cvData JSON", e);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const pdfUrl = cv.cvUrl 
    ? (cv.cvUrl.startsWith("http") ? cv.cvUrl : `${API_BASE}${cv.cvUrl}`)
    : "";

  return (
    <CVReadOnlyContext.Provider value={true}>
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base overflow-hidden shadow-inner">
                {candidateUser?.avaUrl ? (
                  <img src={resolveAvatarUrl(candidateUser.avaUrl)} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{candidateUser?.firstName?.charAt(0) || "U"}</span>
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800 leading-tight">
                  CV - {candidateName}
                </h1>
                <p className="text-[11px] text-gray-400 font-medium truncate max-w-[250px]">
                  Ứng tuyển vị trí: <span className="text-blue-600 font-bold">{job?.title}</span>
                </p>
              </div>
            </div>

            {/* AI Suitability score */}
            {application.matchScore !== null && (
              <>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-1.5 rounded-full shadow-sm">
                  <Brain className="h-4 w-4 text-indigo-500 animate-pulse" />
                  <span className="text-xs text-gray-500 font-medium">Độ phù hợp AI:</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    application.matchLevel === "HIGH" ? "bg-emerald-100 text-emerald-700" :
                    application.matchLevel === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {application.matchLevel === "HIGH" ? "Cao" :
                     application.matchLevel === "MEDIUM" ? "Trung bình" : "Thấp"} ({application.matchScore}%)
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {cv.cvType === "BUILDER" && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1.5">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 5))}
                  className="p-1 hover:text-blue-600 rounded bg-white shadow-sm border border-gray-200 hover:border-blue-200 transition-all active:scale-95"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-gray-550" />
                </button>
                <span className="text-xs font-extrabold text-gray-600 w-12 text-center select-none">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(130, z + 5))}
                  className="p-1 hover:text-blue-600 rounded bg-white shadow-sm border border-gray-200 hover:border-blue-200 transition-all active:scale-95"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-gray-550" />
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>In / Tải PDF</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden bg-slate-100 print:bg-white print:overflow-visible">
          
          {/* Main CV view panel */}
          <main className="flex-1 overflow-auto flex justify-center py-8 px-4 print:p-0 print:bg-white">
            {cv.cvType === "BUILDER" && cvData ? (
              <div
                style={{
                  width: 794,
                  minHeight: 1123,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                  marginBottom: zoom < 100 ? 0 : `${(zoom / 100 - 1) * 1123}px`,
                }}
                className="bg-white shadow-xl rounded-xl border border-gray-250/20 print:shadow-none print:border-0"
              >
                <CVDocument
                  data={cvData}
                  onChange={() => {}} // Read-only: no ops
                  templateId={templateId}
                  colorIndex={colorIndex}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  layout={layout}
                  enabledSections={enabledSections}
                />
              </div>
            ) : (
              // Uploaded PDF viewer
              <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden flex flex-col p-4 h-[85vh]">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>HỒ SƠ ĐỊNH DẠNG PDF TẢI LÊN</span>
                  </div>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100"
                    >
                      Mở trong tab mới
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=1`}
                    className="w-full flex-1 rounded-xl border border-gray-150 shadow-inner"
                    title={`CV PDF - ${candidateName}`}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <AlertCircle className="w-12 h-12 text-gray-300" />
                    <span className="text-sm font-semibold">Không tìm thấy file CV PDF</span>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar - AI Evaluation & Candidate brief info */}
          <aside className="w-80 shrink-0 bg-white border-l border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto print:hidden shadow-2xl shadow-black/5">
            {/* Quick Candidate Profile Card */}
            <div>
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Thông tin nhanh</h3>
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-700 truncate">{candidateName}</span>
                </div>
                {candidateUser?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600 truncate" title={candidateUser.email}>
                      {candidateUser.email}
                    </span>
                  </div>
                )}
                {candidateUser?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600">{candidateUser.phone}</span>
                  </div>
                )}
                {cv.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600">
                      Nộp ngày {new Date(cv.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Suitability Summary Card */}
            {application.matchScore !== null && (
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex items-center gap-1.5 mb-3">
                  <Brain className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Đánh giá từ Trợ lý AI</h3>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/50 border border-indigo-100 rounded-xl p-4 flex-1 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Độ tương thích</div>
                      <div className="text-3xl font-black text-indigo-950 mt-0.5">{application.matchScore}%</div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full border shadow-sm",
                      application.matchLevel === "HIGH" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      application.matchLevel === "MEDIUM" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {application.matchLevel === "HIGH" ? "Phù hợp cao" :
                       application.matchLevel === "MEDIUM" ? "Phù hợp vừa" : "Phù hợp thấp"}
                    </span>
                  </div>

                  <hr className="border-indigo-100/80" />

                  <div className="flex-1 overflow-auto text-xs text-slate-700 leading-relaxed font-medium">
                    <div className="font-bold text-slate-800 mb-1.5">Nhận xét chi tiết:</div>
                    <p className="whitespace-pre-line text-slate-600 bg-white/60 p-3 rounded-lg border border-slate-100 leading-relaxed">
                      {application.aiFeedback || "Chưa có nhận xét chi tiết."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>

        </div>

        {/* Global CSS for Print Styling */}
        <style jsx global>{`
          @media print {
            body {
              margin: 0;
              background: white;
            }
            header, aside, .print\\:hidden {
              display: none !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
              background: white !important;
            }
            div[style*="transform"] {
              transform: none !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: 0 !important;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
        `}</style>
      </div>
    </CVReadOnlyContext.Provider>
  );
}
