"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequirementsSectionProps {
  data: {
    skills: string[];
    experience: string;
    technologies: string[];
    education: string;
    languages: string[];
  };
  onChange: (field: string, value: string | string[]) => void;
}

function TagInput({
  tags,
  placeholder,
  suggestions,
  onAdd,
  onRemove,
}: {
  tags: string[];
  placeholder: string;
  suggestions: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Available = chưa được chọn
  const available = suggestions.filter((s) => !tags.includes(s));

  // Filtered = lọc theo input
  const filtered = input
    ? available.filter((s) => s.toLowerCase().includes(input.toLowerCase()))
    : available;

  const handleAdd = (tag: string) => {
    // Chỉ cho phép thêm nếu nằm trong danh sách gợi ý
    if (!suggestions.includes(tag)) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 1500);
      return;
    }
    if (!tags.includes(tag)) {
      onAdd(tag);
      setInput("");
      setShowSugg(false);
      setInvalid(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      // Nếu có đúng 1 kết quả match thì chọn luôn
      if (filtered.length === 1) {
        handleAdd(filtered[0]);
      } else if (input.trim()) {
        // Không phải trong danh sách → báo lỗi
        setInvalid(true);
        setTimeout(() => setInvalid(false), 1500);
      }
    }
    if (e.key === "Escape") {
      setShowSugg(false);
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  const allSelected = available.length === 0;

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap gap-1.5 border rounded-lg p-2 bg-white min-h-[42px] transition-all
          ${invalid
            ? "border-red-400 ring-2 ring-red-100"
            : "border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
          }`}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {!allSelected && (
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSugg(true); setInvalid(false); }}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : "+ Thêm"}
            className="outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1 min-w-[80px] bg-transparent"
          />
        )}
      </div>

      {/* Error hint */}
      {invalid && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span>⚠</span> Vui lòng chọn kỹ năng từ danh sách gợi ý.
        </p>
      )}

      {/* Dropdown suggestions */}
      {showSugg && !allSelected && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            <>
              {input && (
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  Kết quả tìm kiếm
                </div>
              )}
              {!input && (
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  Chọn từ danh sách
                </div>
              )}
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => handleAdd(s)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-3 w-3 text-blue-400 shrink-0" />
                  {s}
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-3 text-sm text-gray-400 text-center">
              {input ? `Không tìm thấy "${input}" trong danh sách` : "Đã chọn tất cả"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TagInputGrouped({
  tags,
  placeholder,
  categories,
  allItems,
  onAdd,
  onRemove,
}: {
  tags: string[];
  placeholder: string;
  categories: { label: string; items: string[] }[];
  allItems: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const availableItems = allItems.filter(s => !tags.includes(s));

  const filteredCategories = input
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s))
      })).filter(cat => cat.items.length > 0)
    : categories.map(cat => ({
        ...cat,
        items: cat.items.filter(s => !tags.includes(s))
      })).filter(cat => cat.items.length > 0);
  
  const allFilteredItems = filteredCategories.flatMap(c => c.items);

  const handleAdd = (tag: string) => {
    if (!allItems.includes(tag)) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 1500);
      return;
    }
    if (!tags.includes(tag)) {
      onAdd(tag);
      setInput("");
      setShowSugg(false);
      setInvalid(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (allFilteredItems.length === 1) {
        handleAdd(allFilteredItems[0]);
      } else if (input.trim()) {
        setInvalid(true);
        setTimeout(() => setInvalid(false), 1500);
      }
    }
    if (e.key === "Escape") {
      setShowSugg(false);
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  const allSelected = availableItems.length === 0;

  return (
    <div className="relative">
      <div
        className={`flex flex-wrap gap-1.5 border rounded-lg p-2 bg-white min-h-[42px] transition-all
          ${invalid
            ? "border-red-400 ring-2 ring-red-100"
            : "border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
          }`}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {!allSelected && (
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSugg(true); setInvalid(false); }}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : "+ Thêm"}
            className="outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1 min-w-[80px] bg-transparent"
          />
        )}
      </div>

      {invalid && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span>⚠</span> Vui lòng chọn kỹ năng từ danh sách gợi ý.
        </p>
      )}

      {showSugg && !allSelected && (
        <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            <>
              {filteredCategories.map(cat => (
                <div key={cat.label}>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100 sticky top-0">
                    {cat.label}
                  </div>
                  {cat.items.map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => handleAdd(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3 text-blue-400 shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <div className="px-3 py-3 text-sm text-gray-400 text-center">
              {input ? `Không tìm thấy "${input}" trong danh sách` : "Đã chọn tất cả"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skill bank theo ngành ───────────────────────────────────────────────────
const SKILL_CATEGORIES: Record<string, string[]> = {
  "💻 Lập trình & Công nghệ": [
    "ReactJS", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript (ES6+)",
    "HTML/CSS", "Node.js", "Python", "Java", "C#", "C++", "PHP", "Ruby", "Go",
    "Swift", "Kotlin", "Dart/Flutter", "SQL", "Git", "RESTful API", "GraphQL",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Microservices",
    "Redis", "MongoDB", "PostgreSQL", "MySQL", "ElasticSearch",
  ],
  "🎨 Thiết kế": [
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign",
    "After Effects", "Premiere Pro", "UI Design", "UX Research", "Wireframing",
    "Prototyping", "Design System", "Motion Design", "3D Modeling", "Blender",
  ],
  "📊 Marketing & Truyền thông": [
    "SEO/SEM", "Google Ads", "Facebook Ads", "TikTok Ads", "Content Marketing",
    "Email Marketing", "Copywriting", "Social Media Management", "Branding",
    "Market Research", "CRM", "Hubspot", "Google Analytics", "A/B Testing",
    "Influencer Marketing", "PR", "Event Management",
  ],
  "💰 Kinh doanh & Bán hàng": [
    "Sales B2B", "Sales B2C", "Key Account Management", "Business Development",
    "Negotiation", "Cold Calling", "Lead Generation", "CRM (Salesforce)",
    "Retail Management", "Channel Sales", "Telesales", "Upselling",
  ],
  "📈 Tài chính & Kế toán": [
    "Kế toán tổng hợp", "Kế toán thuế", "Kiểm toán", "Phân tích tài chính",
    "Lập báo cáo tài chính", "Excel nâng cao", "SAP", "MISA", "Fast",
    "Quản lý ngân sách", "Định giá", "Thuế TNCN", "Thuế GTGT",
  ],
  "👥 Nhân sự & Hành chính": [
    "Tuyển dụng", "Onboarding", "Đào tạo & Phát triển", "C&B", "HRBP",
    "Luật lao động", "KPI", "OKR", "Quản lý hành chính", "BHXH/BHYT",
    "Employee Engagement", "Talent Acquisition",
  ],
  "🏭 Sản xuất & Kỹ thuật": [
    "Lean Manufacturing", "Six Sigma", "Quản lý chất lượng (QC/QA)",
    "AutoCAD", "SolidWorks", "Kỹ thuật điện", "PLC", "SCADA",
    "Bảo trì máy móc", "ISO 9001", "5S", "Kaizen",
  ],
  "🚚 Logistics & Chuỗi cung ứng": [
    "Quản lý kho", "Xuất nhập khẩu", "Hải quan", "ERP (SAP/Oracle)",
    "Kế hoạch sản xuất", "Quản lý nhà cung cấp", "Inventory Management",
    "Last-mile Delivery", "Incoterms",
  ],
  "🏥 Y tế & Dược phẩm": [
    "Dược lâm sàng", "Y tá/Điều dưỡng", "Xét nghiệm", "Chẩn đoán hình ảnh",
    "Tư vấn dinh dưỡng", "Quản lý bệnh viện", "GMP", "GDP",
  ],
  "🎓 Giáo dục & Đào tạo": [
    "Giảng dạy", "Thiết kế chương trình", "E-learning", "Coaching",
    "Mentoring", "Curriculum Development", "eLMS", "Tiếng Anh giao tiếp",
  ],
  "🤝 Kỹ năng mềm (chung)": [
    "Giao tiếp", "Làm việc nhóm", "Quản lý thời gian", "Tư duy phản biện",
    "Giải quyết vấn đề", "Sáng tạo", "Lãnh đạo", "Thuyết trình",
    "Đàm phán", "Chủ động", "Chịu áp lực tốt",
  ],
};

// Map department keyword → preferred categories
const DEPT_CATEGORY_MAP: Record<string, string[]> = {
  "tech": ["💻 Lập trình & Công nghệ"],
  "cntt": ["💻 Lập trình & Công nghệ"],
  "design": ["🎨 Thiết kế"],
  "thiết kế": ["🎨 Thiết kế"],
  "marketing": ["📊 Marketing & Truyền thông"],
  "kinh doanh": ["💰 Kinh doanh & Bán hàng"],
  "sales": ["💰 Kinh doanh & Bán hàng"],
  "kế toán": ["📈 Tài chính & Kế toán"],
  "tài chính": ["📈 Tài chính & Kế toán"],
  "nhân sự": ["👥 Nhân sự & Hành chính"],
  "hr": ["👥 Nhân sự & Hành chính"],
  "sản xuất": ["🏭 Sản xuất & Kỹ thuật"],
  "kỹ thuật": ["🏭 Sản xuất & Kỹ thuật"],
  "logistics": ["🚚 Logistics & Chuỗi cung ứng"],
  "y tế": ["🏥 Y tế & Dược phẩm"],
  "dược": ["🏥 Y tế & Dược phẩm"],
  "giáo dục": ["🎓 Giáo dục & Đào tạo"],
};

function getDeptCategories(department: string): string[] {
  const dept = department.toLowerCase();
  for (const [key, cats] of Object.entries(DEPT_CATEGORY_MAP)) {
    if (dept.includes(key)) return cats;
  }
  return [];
}

// Flat list of all skills (for validation)
const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

const LANG_SUGGESTIONS = [
  "Tiếng Việt", "Tiếng Anh (Đọc hiểu)", "Tiếng Anh (Giao tiếp)",
  "Tiếng Nhật", "Tiếng Hàn", "Tiếng Trung", "Tiếng Pháp", "Tiếng Đức",
];

export function RequirementsSection({
  data,
  onChange,
  department = "",
}: RequirementsSectionProps & { department?: string }) {
  // Build ordered categories: preferred first, then the rest
  const preferredCats = getDeptCategories(department);
  const orderedCategories = [
    ...preferredCats,
    ...Object.keys(SKILL_CATEGORIES).filter((c) => !preferredCats.includes(c)),
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Nhập các yêu cầu và kỹ năng cần thiết.</p>

      {/* Kỹ năng + Kinh nghiệm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Kỹ năng <span className="text-red-500">*</span>
          </Label>
          <TagInputGrouped
            tags={data.skills}
            categories={orderedCategories.map((cat) => ({
              label: cat,
              items: SKILL_CATEGORIES[cat],
            }))}
            allItems={ALL_SKILLS}
            placeholder="Tìm kỹ năng..."
            onAdd={(t) => onChange("skills", [...data.skills, t])}
            onRemove={(t) => onChange("skills", data.skills.filter((s) => s !== t))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Kinh nghiệm <span className="text-red-500">*</span>
          </Label>
          <Select value={data.experience} onValueChange={(v) => onChange("experience", v)}>
            <SelectTrigger className="h-10 w-full border-gray-200">
              <SelectValue placeholder="Chọn kinh nghiệm" />
            </SelectTrigger>
            <SelectContent>
              {["Chưa có kinh nghiệm", "Dưới 1 năm", "1 – 2 năm", "2 – 4 năm", "4 – 6 năm", "Trên 6 năm"].map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bằng cấp + Ngôn ngữ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Bằng cấp</Label>
          <Select value={data.education} onValueChange={(v) => onChange("education", v)}>
            <SelectTrigger className="h-10 w-full border-gray-200">
              <SelectValue placeholder="Chọn bằng cấp" />
            </SelectTrigger>
            <SelectContent>
              {["Không yêu cầu", "Trung cấp", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ"].map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Ngôn ngữ</Label>
          <TagInput
            tags={data.languages}
            placeholder="Chọn ngôn ngữ..."
            suggestions={LANG_SUGGESTIONS}
            onAdd={(t) => onChange("languages", [...data.languages, t])}
            onRemove={(t) => onChange("languages", data.languages.filter((s) => s !== t))}
          />
        </div>
      </div>
    </div>
  );
}
