"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileDown,
  Layers,
  Palette,
  ZoomIn,
  ZoomOut,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import {
  SectionPanel,
  DEFAULT_SECTIONS,
  SectionConfig,
  SectionKey,
} from "@/components/cv-builder/SectionPanel";
import {
  DesignPanel,
  FONT_FAMILIES,
  LayoutType,
} from "@/components/cv-builder/DesignPanel";
import { CVDocument, CVData } from "@/components/cv-builder/CVDocument";
import { useAuth } from "@/context/AuthContext";

const uid = () => Math.random().toString(36).slice(2);
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const resolveAvatarUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const defaultData = (userAvaUrl?: string): CVData => ({
  avatar: resolveAvatarUrl(userAvaUrl) || "",
  fullName: "Ho va Ten",
  jobTitle: "Vi tri ung tuyen",
  email: "email@example.com",
  phone: "0912 345 678",
  address: "Ha Noi, Viet Nam",
  linkedin: "linkedin.com/in/username",
  website: "portfolio.example.com",
  dob: "01/01/2000",
  summary:
    "Tom tat ban than: Mo ta ngan gon ve kinh nghiem, the manh va muc tieu nghe nghiep cua ban.",
  experiences: [
    {
      id: uid(),
      position: "Frontend Developer",
      company: "Cong ty ABC Technology",
      duration: "01/2023 - Hien tai",
      description:
        "• Phat trien giao dien nguoi dung voi React va Next.js\n• Toi uu hoa hieu suat trang web\n• Phoi hop voi doi ngu backend de tich hop API",
    },
  ],
  education: [
    {
      id: uid(),
      degree: "Cu nhan Cong nghe Thong tin",
      school: "Dai hoc Bach Khoa TPHCM",
      year: "2019 - 2023",
      gpa: "GPA: 3.6/4.0",
    },
  ],
  skills: [
    { id: uid(), skill: "React / Next.js", level: 5 },
    { id: uid(), skill: "TypeScript", level: 4 },
    { id: uid(), skill: "Node.js / NestJS", level: 3 },
    { id: uid(), skill: "UI/UX Design", level: 3 },
  ],
  projects: [
    {
      id: uid(),
      name: "Job Connect Web App",
      tech: "Next.js, NestJS, PostgreSQL",
      description:
        "Nen tang ket noi nha tuyen dung va ung vien, ho tro tim kiem viec lam theo ky nang va muc luong.",
      link: "github.com/example/jobconnect",
    },
  ],
  certificates: [
    {
      id: uid(),
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      year: "2024",
    },
    {
      id: uid(),
      name: "Google UX Design Certificate",
      issuer: "Google / Coursera",
      year: "2023",
    },
  ],
  activities: [
    {
      id: uid(),
      name: "CLB Lap trinh HCMUT",
      role: "Truong ban ky thuat",
      duration: "2021 - 2023",
    },
  ],
  awards: [
    {
      id: uid(),
      name: "Giai Nhat Hackathon Quoc gia",
      org: "Bo KH&CN",
      year: "2023",
    },
  ],
  hobbies:
    "Doc sach ky thuat • Lap trinh ma nguon mo • Choi cau long • Nhieu anh",
});

type ActiveTab = "sections" | "design";

export default function CVBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const id = Number(params?.id);
  const template = CV_TEMPLATES.find((t) => t.id === id);

  const [activeTab, setActiveTab] = useState<ActiveTab>("sections");
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [colorIndex, setColorIndex] = useState(0);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium",
  );
  const [layout, setLayout] = useState<LayoutType>("two-column");
  const [cvData, setCvData] = useState<CVData>(defaultData(user?.avaUrl || undefined));
  const [zoom, setZoom] = useState(80);
  const [cvTitle, setCvTitle] = useState("CV cua toi");
  const [isSaving, setIsSaving] = useState(false);
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [isFromAI, setIsFromAI] = useState(false);
  const [editingCVId, setEditingCVId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Đọc AI-generated data từ sessionStorage nếu đến từ wizard
  useEffect(() => {
    if (searchParams.get("fromAI") === "true") {
      const raw = sessionStorage.getItem("ai-cv-data");
      if (raw) {
        try {
          const aiData: CVData = JSON.parse(raw);
          // Nếu AI trả avatar là path local → resolve URL đầy đủ
          if (aiData.avatar) {
            aiData.avatar = resolveAvatarUrl(aiData.avatar);
          } else if (user?.avaUrl) {
            // Fallback: dùng avatar tài khoản nếu AI không trả avatar
            aiData.avatar = resolveAvatarUrl(user.avaUrl);
          }
          setCvData(aiData);
          // Đặt tên CV từ vị trí công việc AI tạo
          if (aiData.jobTitle) {
            setCvTitle(`CV - ${aiData.jobTitle}`);
          }
          setIsFromAI(true);
          sessionStorage.removeItem("ai-cv-data");
        } catch (e) {
          console.error("Failed to parse AI CV data", e);
        }
      }
    }
    // Đọc CV data từ sessionStorage nếu đang edit
    else if (searchParams.get("edit")) {
      const raw = sessionStorage.getItem("edit-cv-data");
      if (raw) {
        try {
          const editData = JSON.parse(raw);
          setEditingCVId(editData.cvId);

          // Load CV data
          if (editData.cvData) {
            const savedData = editData.cvData;

            // Restore CV content
            if (savedData.fullName) setCvData(savedData);

            // Restore design settings
            if (
              savedData.templateId !== undefined &&
              savedData.templateId === id
            ) {
              if (savedData.colorIndex !== undefined)
                setColorIndex(savedData.colorIndex);
              if (savedData.fontFamily) setFontFamily(savedData.fontFamily);
              if (savedData.fontSize) setFontSize(savedData.fontSize);
              if (savedData.layout) setLayout(savedData.layout);

              // Restore sections
              if (savedData.sections) {
                const restoredSections = DEFAULT_SECTIONS.map((section) => {
                  const saved = savedData.sections.find(
                    (s: any) => s.key === section.key,
                  );
                  return saved
                    ? { ...section, enabled: saved.enabled }
                    : section;
                });
                setSections(restoredSections);
              }
            }

            // Set CV title
            setCvTitle(
              editData.cvData.jobTitle
                ? `CV - ${editData.cvData.jobTitle}`
                : "CV của tôi",
            );
          }

          sessionStorage.removeItem("edit-cv-data");
        } catch (e) {
          console.error("Failed to parse edit CV data", e);
        }
      }
    }
  }, [searchParams, id]);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToastInfo({ message, type });
    setTimeout(() => setToastInfo(null), 3000);
  };

  const enabledSections = sections
    .filter((s) => s.enabled)
    .map((s) => s.key) as SectionKey[];

  const handleSaveCV = async () => {
    if (!template) {
      showToast("Không tìm thấy mẫu CV", "error");
      return;
    }

    if (!user || user.role !== "CANDIDATE") {
      showToast("Vui lòng đăng nhập với tài khoản ứng viên để lưu CV", "error");
      setTimeout(() => router.push("/auth/login"), 1500);
      return;
    }

    if (!cvTitle.trim()) {
      showToast("Vui lòng nhập tên CV", "error");
      return;
    }

    if (!token) {
      showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại", "error");
      setTimeout(() => router.push("/auth/login"), 1500);
      return;
    }

    setIsSaving(true);
    try {
      // Lấy HTML content của CV để generate PDF
      const cvElement = document.querySelector("[data-cv-document]");
      if (!cvElement) {
        throw new Error("Không tìm thấy nội dung CV");
      }

      // Clone element và convert tất cả computed styles thành inline styles
      const clonedElement = cvElement.cloneNode(true) as HTMLElement;

      // Function to inline all computed styles recursively
      const inlineStyles = (element: HTMLElement) => {
        const computedStyle = window.getComputedStyle(element);
        let styleString = "";

        // Copy all computed styles
        for (let i = 0; i < computedStyle.length; i++) {
          const property = computedStyle[i];
          const value = computedStyle.getPropertyValue(property);
          styleString += `${property}:${value};`;
        }

        element.setAttribute("style", styleString);

        // Recursively inline styles for all children
        Array.from(element.children).forEach((child) => {
          if (child instanceof HTMLElement) {
            inlineStyles(child);
          }
        });
      };

      // Apply inline styles to cloned element
      inlineStyles(clonedElement);

      // Create clean HTML with inline styles only (all computed styles are already inlined)
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head>
<body>
${clonedElement.outerHTML}
</body>
</html>`;

      // Chuẩn bị CV data để lưu dưới dạng JSON
      const cvDataToSave = {
        ...cvData,
        templateId: template.id,
        colorIndex,
        fontFamily,
        fontSize,
        layout,
        sections: sections.map((s) => ({ key: s.key, enabled: s.enabled })),
      };

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      console.log("Sending request...");
      console.log("HTML length:", htmlContent.length);
      console.log("CV Data:", cvDataToSave);
      console.log("Editing CV ID:", editingCVId);

      // Nếu đang edit CV, xóa CV cũ trước khi tạo mới
      if (editingCVId) {
        try {
          await fetch(`${API_URL}/cvs/${editingCVId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Deleted old CV:", editingCVId);
        } catch (error) {
          console.error("Error deleting old CV:", error);
          // Continue anyway
        }
      }

      const response = await fetch(`${API_URL}/cvs/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: cvTitle,
          htmlContent: htmlContent,
          cvData: cvDataToSave,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        console.error("Server error:", error);
        throw new Error(error?.message || "Không thể lưu CV");
      }

      const result = await response.json();
      showToast(
        editingCVId ? "Cập nhật CV thành công!" : "Lưu CV thành công!",
        "success",
      );
      setTimeout(() => router.push("/profile/dashboard"), 1500);
    } catch (error: any) {
      console.error("Failed to save CV:", error);
      showToast(error.message || "Có lỗi xảy ra khi lưu CV", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get computed styles
  const getComputedStyles = (element: Element): string => {
    const styles = window.getComputedStyle(element);
    let cssText = "";

    // Get all inline styles from the document
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule) => {
          cssText += rule.cssText + "\n";
        });
      } catch (e) {
        // Skip external stylesheets due to CORS
      }
    });

    return cssText;
  };

  if (!template) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm">
          <p className="text-gray-500 mb-4">Khong tim thay mau CV.</p>
          <button
            onClick={() => router.push("/cv")}
            className="text-blue-600 underline text-sm"
          >
            Quay lai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden relative">
      {toastInfo && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-2xl shadow-black/20 text-[15px] font-semibold flex items-center gap-3 animate-in slide-in-from-bottom-8 fade-in transition-all duration-300 ${
            toastInfo.type === "error"
              ? "bg-white border-l-4 border-red-500 text-gray-800"
              : "bg-white border-l-4 border-green-500 text-gray-800"
          }`}
        >
          {toastInfo.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          {toastInfo.message}
        </div>
      )}

      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(isFromAI ? "/cv-builder/ai" : "/cv")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lai</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">Kiểu CV:</span>
              <span className="text-sm font-semibold text-blue-600">
                {template.name}
              </span>
            </div>
            {isFromAI && (
              <>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-[#1877F2] px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Được tạo bởi AI</span>
                </div>
              </>
            )}
            {editingCVId && (
              <>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-600 px-3 py-1 rounded-full">
                  <span className="text-xs font-bold">Đang chỉnh sửa</span>
                </div>
              </>
            )}
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Tên CV:</span>
              <input
                type="text"
                value={cvTitle}
                onChange={(e) => setCvTitle(e.target.value)}
                placeholder="Nhap ten CV..."
                className="text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1.5">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-0.5 hover:text-blue-600 rounded"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-xs font-medium text-gray-600 w-10 text-center select-none">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-0.5 hover:text-blue-600 rounded"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <button
            onClick={handleSaveCV}
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSaving
                ? editingCVId
                  ? "Đang cập nhật..."
                  : "Đang lưu..."
                : editingCVId
                  ? "Cập nhật CV"
                  : "Lưu CV"}
            </span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Tải PDF</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        <aside className="w-[240px] shrink-0 flex flex-col bg-white border-r border-gray-200 print:hidden">
          <div className="flex border-b border-gray-200 shrink-0">
            {(["sections", "design"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/40" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {tab === "sections" ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : (
                  <Palette className="w-3.5 h-3.5" />
                )}
                {tab === "sections" ? "Mục CV" : "Thiết kế"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === "sections" ? (
              <SectionPanel sections={sections} onChange={setSections} />
            ) : (
              <DesignPanel
                templateId={template.id}
                colorIndex={colorIndex}
                onColorChange={setColorIndex}
                fontFamily={fontFamily}
                onFontChange={setFontFamily}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                layout={layout}
                onLayoutChange={setLayout}
              />
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-gray-200 flex justify-center py-8 px-4 print:p-0 print:bg-white">
          <div
            style={{
              width: 794,
              minHeight: 1123,
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              marginBottom: zoom < 100 ? 0 : `${(zoom / 100 - 1) * 1123}px`,
            }}
            className="bg-white shadow-2xl print:shadow-none"
          >
            <CVDocument
              data={cvData}
              onChange={setCvData}
              templateId={template.id}
              colorIndex={colorIndex}
              fontFamily={fontFamily}
              fontSize={fontSize}
              layout={layout}
              enabledSections={enabledSections}
            />
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
