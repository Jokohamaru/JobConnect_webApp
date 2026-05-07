"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileDown, Layers, Palette, ZoomIn, ZoomOut } from "lucide-react";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import { SectionPanel, DEFAULT_SECTIONS, SectionConfig, SectionKey } from "@/components/cv-builder/SectionPanel";
import { DesignPanel, FONT_FAMILIES, LayoutType } from "@/components/cv-builder/DesignPanel";
import { CVDocument, CVData } from "@/components/cv-builder/CVDocument";

const uid = () => Math.random().toString(36).slice(2);

const defaultData = (): CVData => ({
  avatar: "",
  fullName: "Ho va Ten",
  jobTitle: "Vi tri ung tuyen",
  email: "email@example.com",
  phone: "0912 345 678",
  address: "Ha Noi, Viet Nam",
  linkedin: "linkedin.com/in/username",
  website: "portfolio.example.com",
  dob: "01/01/2000",
  summary: "Tom tat ban than: Mo ta ngan gon ve kinh nghiem, the manh va muc tieu nghe nghiep cua ban.",
  experiences: [{ id: uid(), position: "Frontend Developer", company: "Cong ty ABC Technology", duration: "01/2023 - Hien tai", description: "• Phat trien giao dien nguoi dung voi React va Next.js\n• Toi uu hoa hieu suat trang web\n• Phoi hop voi doi ngu backend de tich hop API" }],
  education: [{ id: uid(), degree: "Cu nhan Cong nghe Thong tin", school: "Dai hoc Bach Khoa TPHCM", year: "2019 - 2023", gpa: "GPA: 3.6/4.0" }],
  skills: [{ id: uid(), skill: "React / Next.js", level: 5 }, { id: uid(), skill: "TypeScript", level: 4 }, { id: uid(), skill: "Node.js / NestJS", level: 3 }, { id: uid(), skill: "UI/UX Design", level: 3 }],
  projects: [{ id: uid(), name: "Job Connect Web App", tech: "Next.js, NestJS, PostgreSQL", description: "Nen tang ket noi nha tuyen dung va ung vien, ho tro tim kiem viec lam theo ky nang va muc luong.", link: "github.com/example/jobconnect" }],
  certificates: [{ id: uid(), name: "AWS Certified Developer", issuer: "Amazon Web Services", year: "2024" }, { id: uid(), name: "Google UX Design Certificate", issuer: "Google / Coursera", year: "2023" }],
  activities: [{ id: uid(), name: "CLB Lap trinh HCMUT", role: "Truong ban ky thuat", duration: "2021 - 2023" }],
  awards: [{ id: uid(), name: "Giai Nhat Hackathon Quoc gia", org: "Bo KH&CN", year: "2023" }],
  hobbies: "Doc sach ky thuat • Lap trinh ma nguon mo • Choi cau long • Nhieu anh",
});

type ActiveTab = "sections" | "design";

export default function CVBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const template = CV_TEMPLATES.find((t) => t.id === id);

  const [activeTab, setActiveTab] = useState<ActiveTab>("sections");
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [colorIndex, setColorIndex] = useState(0);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [layout, setLayout] = useState<LayoutType>("two-column");
  const [cvData, setCvData] = useState<CVData>(defaultData);
  const [zoom, setZoom] = useState(80);

  const enabledSections = sections.filter((s) => s.enabled).map((s) => s.key) as SectionKey[];

  if (!template) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm">
          <p className="text-gray-500 mb-4">Khong tim thay mau CV.</p>
          <button onClick={() => router.push("/cv")} className="text-blue-600 underline text-sm">Quay lai</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/cv")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lai</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-400">CV Builder</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-blue-600">{template.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1.5">
          <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-0.5 hover:text-blue-600 rounded">
            <ZoomOut className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs font-medium text-gray-600 w-10 text-center select-none">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(130, z + 10))} className="p-0.5 hover:text-blue-600 rounded">
            <ZoomIn className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          <FileDown className="w-4 h-4" />
          <span>Tai PDF</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        <aside className="w-[240px] shrink-0 flex flex-col bg-white border-r border-gray-200 print:hidden">
          <div className="flex border-b border-gray-200 shrink-0">
            {(["sections", "design"] as ActiveTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/40" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                {tab === "sections" ? <Layers className="w-3.5 h-3.5" /> : <Palette className="w-3.5 h-3.5" />}
                {tab === "sections" ? "Muc CV" : "Thiet ke"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === "sections"
              ? <SectionPanel sections={sections} onChange={setSections} />
              : <DesignPanel colorIndex={colorIndex} onColorChange={setColorIndex} fontFamily={fontFamily} onFontChange={setFontFamily} fontSize={fontSize} onFontSizeChange={setFontSize} layout={layout} onLayoutChange={setLayout} />
            }
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-gray-200 flex justify-center py-8 px-4 print:p-0 print:bg-white">
          <div
            style={{ width: 794, minHeight: 1123, transform: `scale(${zoom / 100})`, transformOrigin: "top center", marginBottom: zoom < 100 ? 0 : `${(zoom / 100 - 1) * 1123}px` }}
            className="bg-white shadow-2xl print:shadow-none"
          >
            <CVDocument data={cvData} onChange={setCvData} colorIndex={colorIndex} fontFamily={fontFamily} fontSize={fontSize} layout={layout} enabledSections={enabledSections} />
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}