"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X, Plus, Globe } from "lucide-react";
import { useState } from "react";
import { FormProps } from "../sections/types";

const LANG_OPTIONS = [
  "Tiếng Anh",
  "Tiếng Trung",
  "Tiếng Nhật",
  "Tiếng Hàn",
  "Tiếng Pháp",
  "Tiếng Đức",
  "Tiếng Tây Ban Nha",
  "Khác",
];

const LEVEL_OPTIONS = ["Cơ bản", "Giao tiếp", "Thành thạo", "Bản ngữ"];

const LANG_FLAG: Record<string, string> = {
  "Tiếng Anh": "🇬🇧",
  "Tiếng Trung": "🇨🇳",
  "Tiếng Nhật": "🇯🇵",
  "Tiếng Hàn": "🇰🇷",
  "Tiếng Pháp": "🇫🇷",
  "Tiếng Đức": "🇩🇪",
  "Tiếng Tây Ban Nha": "🇪🇸",
  "Khác": "🌐",
};

export default function LangForm({ data, setData }: FormProps) {
  const [lang, setLang] = useState({ name: "", level: "", cert: "" });

  const safeData = Array.isArray(data) ? data : [];

  const addLang = () => {
    if (!lang.name || !lang.level) return;
    setData([...safeData, lang]);
    setLang({ name: "", level: "", cert: "" });
  };

  const removeLang = (index: number) => {
    setData(safeData.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Added languages */}
      {safeData.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngôn ngữ đã thêm</p>
          <div className="flex flex-wrap gap-2">
            {safeData.map((l: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-100 rounded-xl text-sm font-medium text-cyan-700 group"
              >
                <span>{LANG_FLAG[l.name] ?? "🌐"}</span>
                <span>{l.name}</span>
                <span className="text-cyan-400">·</span>
                <span className="text-cyan-600">{l.level}</span>
                {l.cert && (
                  <>
                    <span className="text-cyan-400">·</span>
                    <span className="text-cyan-500 text-xs">{l.cert}</span>
                  </>
                )}
                {/* Nút X - dùng button riêng, stopPropagation để tránh conflict */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLang(index);
                  }}
                  className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-cyan-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New language form */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-500" />
          Thêm ngôn ngữ mới
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngôn ngữ <span className="text-red-400">*</span></Label>
            <Select value={lang.name} onValueChange={(v) => setLang({ ...lang, name: v })}>
              <SelectTrigger className="rounded-xl border-gray-200">
                <SelectValue placeholder="-- Chọn ngôn ngữ --" />
              </SelectTrigger>
              <SelectContent>
                {LANG_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LANG_FLAG[l] ?? "🌐"} {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trình độ <span className="text-red-400">*</span></Label>
            <Select value={lang.level} onValueChange={(v) => setLang({ ...lang, level: v })}>
              <SelectTrigger className="rounded-xl border-gray-200">
                <SelectValue placeholder="-- Chọn trình độ --" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chứng chỉ (tùy chọn)</Label>
            <Input
              placeholder="VD: IELTS 7.0, JLPT N2..."
              value={lang.cert}
              onChange={(e) => setLang({ ...lang, cert: e.target.value })}
              className="rounded-xl border-gray-200"
            />
          </div>
        </div>

        <Button
          onClick={addLang}
          type="button"
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm ngôn ngữ
        </Button>
      </div>
    </div>
  );
}
