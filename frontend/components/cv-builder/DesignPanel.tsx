"use client";

import { Palette, Type, Layout } from "lucide-react";

export const COLOR_THEMES = [
  { name: "Xanh dương", primary: "#1d4ed8", sidebar: "#dbeafe", sidebarText: "#1e3a8a" },
  { name: "Xanh lá",    primary: "#16a34a", sidebar: "#dcfce7", sidebarText: "#14532d" },
  { name: "Tím",        primary: "#7c3aed", sidebar: "#ede9fe", sidebarText: "#4c1d95" },
  { name: "Đỏ",         primary: "#dc2626", sidebar: "#fee2e2", sidebarText: "#7f1d1d" },
  { name: "Xám đen",    primary: "#374151", sidebar: "#f3f4f6", sidebarText: "#111827" },
  { name: "Xanh ngọc",  primary: "#0891b2", sidebar: "#cffafe", sidebarText: "#164e63" },
];

export const FONT_FAMILIES = [
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Arial",           value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia",         value: "Georgia, 'Times New Roman', serif" },
  { label: "Roboto",          value: "'Roboto', sans-serif" },
];

export type LayoutType = "two-column" | "one-column";

interface DesignPanelProps {
  templateId?: number;
  colorIndex: number;
  onColorChange: (i: number) => void;
  fontFamily: string;
  onFontChange: (f: string) => void;
  fontSize: "small" | "medium" | "large";
  onFontSizeChange: (s: "small" | "medium" | "large") => void;
  layout: LayoutType;
  onLayoutChange: (l: LayoutType) => void;
}

export function DesignPanel({
  templateId,
  colorIndex, onColorChange,
  fontFamily, onFontChange,
  fontSize, onFontSizeChange,
  layout, onLayoutChange,
}: DesignPanelProps) {
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-y-auto">
      <div className="px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Thiết kế</h2>
        <p className="text-xs text-gray-400 mt-0.5">Tuỳ chỉnh màu sắc & bố cục</p>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Color theme */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Màu chủ đề</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_THEMES.map((theme, i) => (
              <button
                key={i}
                onClick={() => onColorChange(i)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                  colorIndex === i ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex gap-0.5">
                  <div className="w-4 h-6 rounded-l-sm" style={{ backgroundColor: theme.sidebar }} />
                  <div className="w-6 h-6 rounded-r-sm" style={{ backgroundColor: theme.primary + "33" }}>
                    <div className="w-full h-1.5 rounded-tr-sm" style={{ backgroundColor: theme.primary }} />
                  </div>
                </div>
                <span className="text-[9px] text-gray-500 text-center leading-tight">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout */}
        {templateId !== 1 && templateId !== 2 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bố cục</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["two-column", "one-column"] as LayoutType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLayoutChange(l)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    layout === l ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  {l === "two-column" ? (
                    <div className="flex gap-0.5 w-10 h-8">
                      <div className="w-3 h-full bg-gray-700 rounded-sm" />
                      <div className="flex-1 h-full bg-gray-200 rounded-sm" />
                    </div>
                  ) : (
                    <div className="w-10 h-8 bg-gray-200 rounded-sm flex flex-col gap-1 p-1">
                      <div className="w-full h-2 bg-gray-400 rounded-sm" />
                      <div className="w-3/4 h-1.5 bg-gray-300 rounded-sm" />
                      <div className="w-full h-1.5 bg-gray-300 rounded-sm" />
                    </div>
                  )}
                  <span className="text-[10px] text-gray-600 font-medium">
                    {l === "two-column" ? "2 cột" : "1 cột"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Font family */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phông chữ</span>
          </div>
          <div className="space-y-1.5">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f.value}
                onClick={() => onFontChange(f.value)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                  fontFamily === f.value
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-100 hover:border-gray-300 text-gray-600"
                }`}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cỡ chữ</span>
          </div>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onFontSizeChange(s)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                  fontSize === s
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {s === "small" ? "Nhỏ" : s === "medium" ? "Vừa" : "Lớn"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
