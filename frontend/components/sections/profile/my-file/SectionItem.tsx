"use client";

import { Plus, Pencil, GraduationCap, Briefcase, Zap, Globe, LayoutGrid, Award, Medal, User, CheckCircle2, ExternalLink } from "lucide-react";
import { Section } from "./sections/types";
import { format } from "date-fns";

interface Props {
  data: any;
  section: Section;
  onClick: () => void;
}

// Map icon backgrounds per section key
const sectionMeta: Record<string, { bg: string; iconBg: string; iconColor: string; accent: string }> = {
  intro: { bg: "from-blue-50 to-blue-50/0", iconBg: "bg-blue-100", iconColor: "text-blue-600", accent: "border-blue-400" },
  edu: { bg: "from-indigo-50 to-indigo-50/0", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", accent: "border-indigo-400" },
  exp: { bg: "from-violet-50 to-violet-50/0", iconBg: "bg-violet-100", iconColor: "text-violet-600", accent: "border-violet-400" },
  skill: { bg: "from-emerald-50 to-emerald-50/0", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", accent: "border-emerald-400" },
  lang: { bg: "from-cyan-50 to-cyan-50/0", iconBg: "bg-cyan-100", iconColor: "text-cyan-600", accent: "border-cyan-400" },
  proj: { bg: "from-orange-50 to-orange-50/0", iconBg: "bg-orange-100", iconColor: "text-orange-600", accent: "border-orange-400" },
  cert: { bg: "from-pink-50 to-pink-50/0", iconBg: "bg-pink-100", iconColor: "text-pink-600", accent: "border-pink-400" },
  award: { bg: "from-yellow-50 to-yellow-50/0", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", accent: "border-yellow-400" },
};

function hasData(type: string, data: any): boolean {
  if (type === "intro") return !!data?.title;
  if (type === "skill") return (data?.skillCore?.length ?? 0) > 0 || (data?.skillSoft?.length ?? 0) > 0;
  return Array.isArray(data) && data.length > 0;
}

export default function SectionItem({ data, section, onClick }: Props) {
  const meta = sectionMeta[section.key] || sectionMeta.intro;
  const filled = hasData(section.key, data);

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border border-gray-100 bg-white overflow-hidden
        shadow-sm hover:shadow-md cursor-pointer
        transition-all duration-300 hover:-translate-y-0.5 group
      `}
    >
      {/* Subtle gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${meta.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex items-start gap-4 p-5">
        {/* Icon */}
        <div className={`shrink-0 w-11 h-11 rounded-xl ${meta.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <span className={meta.iconColor}>{section.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 text-base group-hover:text-blue-700 transition-colors">
              {section.title}
            </h3>
            {filled && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </div>

          {/* Preview */}
          <SectionPreview type={section.key} data={data} accent={meta.accent} />
        </div>

        {/* Action button */}
        <button
          className={`
            shrink-0 w-9 h-9 rounded-full flex items-center justify-center
            border-2 transition-all duration-300
            ${filled
              ? "border-blue-200 text-blue-500 group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white"
              : "border-dashed border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400"}
          `}
        >
          {filled ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Bottom accent bar */}
      {filled && (
        <div className={`h-0.5 bg-gradient-to-r from-transparent via-current to-transparent ${meta.iconColor} opacity-20`} />
      )}
    </div>
  );
}

/* ── Section Previews ──────────────────────────────────────────────────────── */

function SectionPreview({ type, data, accent }: { type: string; data: any; accent: string }) {
  switch (type) {
    case "intro":
      return data?.title ? (
        <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{data.title}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">Giới thiệu điểm mạnh và số năm kinh nghiệm</p>
      );

    case "edu":
      return !Array.isArray(data) || data.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Chia sẻ trình độ học vấn của bạn</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.map((item: any, i: number) => (
            <div key={i} className={`pl-3 border-l-2 ${accent}`}>
              <p className="text-sm font-semibold text-gray-700">{item.school}</p>
              <p className="text-xs text-gray-500">
                {item.major}{item.degree && ` · ${item.degree}`}
              </p>
              {(item.startYear || item.endYear) && (
                <p className="text-xs text-gray-400">
                  {item.startYear ? format(new Date(item.startYear), "MM/yyyy") : "?"} –{" "}
                  {item.endYear ? format(new Date(item.endYear), "MM/yyyy") : "Nay"}
                </p>
              )}
            </div>
          ))}
          <CountBadge count={data.length} label="học vấn" />
        </div>
      );

    case "exp":
      return !Array.isArray(data) || data.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Thể hiện quá trình làm việc của bạn</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.map((item: any, i: number) => (
            <div key={i} className={`pl-3 border-l-2 ${accent}`}>
              <p className="text-sm font-semibold text-gray-700">{item.company}</p>
              <p className="text-xs text-gray-500">{item.position}</p>
              {(item.startYear || item.endYear) && (
                <p className="text-xs text-gray-400">
                  {item.startYear ? format(new Date(item.startYear), "MM/yyyy") : "?"} –{" "}
                  {item.endYear ? format(new Date(item.endYear), "MM/yyyy") : "Hiện tại"}
                </p>
              )}
            </div>
          ))}
          <CountBadge count={data.length} label="kinh nghiệm" />
        </div>
      );

    case "skill":
      const allSkills = [...(data?.skillCore || []), ...(data?.skillSoft || [])];
      return allSkills.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Liệt kê các kỹ năng chuyên môn</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {allSkills.slice(0, 8).map((s: string, i: number) => (
            <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              {s}
            </span>
          ))}
          {allSkills.length > 8 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
              +{allSkills.length - 8}
            </span>
          )}
        </div>
      );

    case "lang":
      return !Array.isArray(data) || data.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Liệt kê các ngôn ngữ bạn biết</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {data.map((item: any, i: number) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
              <span className="text-base">{getLangFlag(item.name)}</span>
              {item.name}
              <span className="opacity-60">· {item.level}</span>
            </span>
          ))}
        </div>
      );

    case "proj":
      return !Array.isArray(data) || data.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Giới thiệu dự án nổi bật của bạn</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.map((item: any, i: number) => (
            <div key={i} className={`pl-3 border-l-2 ${accent}`}>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                {item.urlLink && (
                  <ExternalLink className="w-3 h-3 text-orange-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500">{item.role}</p>
              {(item.fromDate || item.toDate) && (
                <p className="text-xs text-gray-400">
                  {item.fromDate ? format(new Date(item.fromDate), "MM/yyyy") : "?"} –{" "}
                  {item.toDate ? format(new Date(item.toDate), "MM/yyyy") : "Nay"}
                </p>
              )}
            </div>
          ))}
          <CountBadge count={data.length} label="dự án" />
        </div>
      );

    case "cert":
      return !Array.isArray(data) || data.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Bổ sung chứng chỉ liên quan đến kỹ năng</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.map((item: any, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${accent.replace("border-", "bg-")}`} />
              <div>
                <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">{item.organization}</p>
              </div>
            </div>
          ))}
          <CountBadge count={data.length} label="chứng chỉ" />
        </div>
      );

    case "award":
      return !Array.isArray(data) || data.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Thể hiện thành tích và giải thưởng đạt được</p>
      ) : (
        <div className="mt-2 space-y-2">
          {data.map((item: any, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-base shrink-0">🏆</span>
              <div>
                <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.organization}{item.year ? ` · ${format(new Date(item.year), "yyyy")}` : ""}
                </p>
              </div>
            </div>
          ))}
          <CountBadge count={data.length} label="giải thưởng" />
        </div>
      );

    default:
      return null;
  }
}

function CountBadge({ count, label }: { count: number; label: string }) {
  return (
    <p className="text-xs text-gray-400 mt-1">
      {count} {label} đã thêm · <span className="text-blue-400 hover:underline">Nhấn để chỉnh sửa</span>
    </p>
  );
}

function getLangFlag(name: string): string {
  const map: Record<string, string> = {
    "Tiếng Anh": "🇬🇧", "English": "🇬🇧",
    "Tiếng Nhật": "🇯🇵", "Japanese": "🇯🇵",
    "Tiếng Hàn": "🇰🇷", "Korean": "🇰🇷",
    "Tiếng Trung": "🇨🇳", "Chinese": "🇨🇳",
    "Tiếng Pháp": "🇫🇷", "French": "🇫🇷",
    "Tiếng Đức": "🇩🇪", "German": "🇩🇪",
    "Tiếng Tây Ban Nha": "🇪🇸", "Spanish": "🇪🇸",
  };
  return map[name] || "🌐";
}
