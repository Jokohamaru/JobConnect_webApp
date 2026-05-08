"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobDescriptionSectionProps {
  description: string;
  onChange: (value: string) => void;
}

// ─── execCommand wrapper ──────────────────────────────────────────────────────
function exec(cmd: string, value = "") {
  document.execCommand(cmd, false, value);
}

// ─── Toolbar config ───────────────────────────────────────────────────────────
const TEXT_STYLES = [
  { label: "Normal",    tag: "p",  cmd: "formatBlock", val: "p" },
  { label: "Heading 1", tag: "h1", cmd: "formatBlock", val: "h1" },
  { label: "Heading 2", tag: "h2", cmd: "formatBlock", val: "h2" },
  { label: "Heading 3", tag: "h3", cmd: "formatBlock", val: "h3" },
];

const FONT_SIZES = [
  { label: "Nhỏ", value: "1" },
  { label: "Thường", value: "3" },
  { label: "Lớn", value: "5" },
  { label: "Rất lớn", value: "7" },
];

interface ToolbarBtn {
  icon: string;
  label: string;
  cmd?: string;
  val?: string;
  action?: (ed: HTMLDivElement) => void;
  check?: string; // execCommand name to check active state
}

const TOOLBAR: ToolbarBtn[][] = [
  [
    { icon: "B",  label: "Bold",      cmd: "bold",      check: "bold" },
    { icon: "I",  label: "Italic",    cmd: "italic",    check: "italic" },
    { icon: "U",  label: "Underline", cmd: "underline", check: "underline" },
    { icon: "S̶",  label: "Strikethrough", cmd: "strikethrough", check: "strikethrough" },
  ],
  [
    { icon: "≡",  label: "Unordered list",  cmd: "insertUnorderedList", check: "insertUnorderedList" },
    { icon: "≡₁", label: "Ordered list",    cmd: "insertOrderedList",   check: "insertOrderedList" },
  ],
  [
    { icon: "⇤",  label: "Align left",    cmd: "justifyLeft",   check: "justifyLeft" },
    { icon: "⇔",  label: "Align center",  cmd: "justifyCenter", check: "justifyCenter" },
    { icon: "⇥",  label: "Align right",   cmd: "justifyRight",  check: "justifyRight" },
    { icon: "⇼",  label: "Justify",       cmd: "justifyFull",   check: "justifyFull" },
  ],
  [
    {
      icon: "⤵",
      label: "Indent",
      cmd: "indent",
    },
    {
      icon: "⤴",
      label: "Outdent",
      cmd: "outdent",
    },
  ],
  [
    {
      icon: "🔗",
      label: "Link",
      action: (ed) => {
        const url = prompt("Nhập URL:");
        if (url) exec("createLink", url);
      },
    },
    {
      icon: "🚫",
      label: "Unlink",
      cmd: "unlink",
    },
    {
      icon: "⎌",
      label: "Undo",
      cmd: "undo",
    },
    {
      icon: "⎍",
      label: "Redo",
      cmd: "redo",
    },
  ],
];

// Color palettes
const TEXT_COLORS = [
  "#000000", "#374151", "#1d4ed8", "#15803d", "#b91c1c",
  "#7c3aed", "#0369a1", "#c2410c", "#a16207", "#0f766e",
];
const BG_COLORS = [
  "#fef9c3", "#dbeafe", "#dcfce7", "#fee2e2", "#ede9fe",
  "#e0f2fe", "#ffedd5", "#fce7f3", "#f0fdf4", "#f8fafc",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function JobDescriptionSection({
  description,
  onChange,
}: JobDescriptionSectionProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showAiTip, setShowAiTip] = useState(true);
  const [activeCommands, setActiveCommands] = useState<Set<string>>(new Set());
  const [showColorPicker, setShowColorPicker] = useState<"text" | "bg" | null>(null);
  const [wordCount, setWordCount] = useState(0);

  // Init editor content once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && description) {
      // Convert plain text \n bullets to HTML
      const html = description
        .split("\n")
        .map((line) => `<p>${line || "<br>"}</p>`)
        .join("");
      editorRef.current.innerHTML = html;
      updateWordCount();
    }
  }, []); // eslint-disable-line

  const updateWordCount = useCallback(() => {
    const text = editorRef.current?.innerText || "";
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  }, []);

  const updateActiveCommands = useCallback(() => {
    try {
      const cmds = new Set<string>();
      const all = ["bold","italic","underline","strikethrough","insertUnorderedList","insertOrderedList","justifyLeft","justifyCenter","justifyRight","justifyFull"];
      all.forEach((cmd) => {
        if (document.queryCommandState(cmd)) cmds.add(cmd);
      });
      setActiveCommands(cmds);
    } catch {}
  }, []);

  const handleInput = useCallback(() => {
    onChange(editorRef.current?.innerHTML || "");
    updateWordCount();
    updateActiveCommands();
  }, [onChange, updateWordCount, updateActiveCommands]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent losing focus on toolbar button click handled separately
      updateActiveCommands();
    },
    [updateActiveCommands]
  );

  const handleToolbarBtn = useCallback(
    (btn: ToolbarBtn) => {
      editorRef.current?.focus();
      if (btn.action) {
        btn.action(editorRef.current!);
      } else if (btn.cmd) {
        exec(btn.cmd, btn.val || "");
      }
      handleInput();
      updateActiveCommands();
    },
    [handleInput, updateActiveCommands]
  );

  const handleStyleChange = (val: string) => {
    editorRef.current?.focus();
    exec("formatBlock", val);
    handleInput();
  };

  const handleFontSizeChange = (val: string) => {
    editorRef.current?.focus();
    exec("fontSize", val);
    handleInput();
  };

  const handleColor = (color: string, type: "text" | "bg") => {
    editorRef.current?.focus();
    exec(type === "text" ? "foreColor" : "hiliteColor", color);
    setShowColorPicker(null);
    handleInput();
  };

  const applyAiSuggestion = () => {
    if (!editorRef.current) return;
    const suggestion = `\n<ul>
  <li>Tối ưu <strong>performance</strong> ứng dụng, đảm bảo responsive trên mọi thiết bị.</li>
  <li>Xây dựng <strong>component</strong> tái sử dụng theo mô hình <em>state management</em>.</li>
</ul>`;
    editorRef.current.innerHTML += suggestion;
    onChange(editorRef.current.innerHTML);
    setShowAiTip(false);
    updateWordCount();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Mô tả chi tiết về công việc và trách nhiệm.</p>

      {/* ── Editor Box ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">

        {/* ── Toolbar Row 1: Style + Font size ── */}
        <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-3 py-2 flex-wrap">
          {/* Text block style */}
          <select
            onChange={(e) => handleStyleChange(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            {TEXT_STYLES.map((s) => (
              <option key={s.val} value={s.val}>{s.label}</option>
            ))}
          </select>

          {/* Font size */}
          <select
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <div className="w-px h-5 bg-gray-200" />

          {/* Color pickers */}
          <div className="relative">
            <button
              title="Màu chữ"
              onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(showColorPicker === "text" ? null : "text"); }}
              className="flex flex-col items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
            >
              <span className="text-[13px] font-bold leading-none" style={{ color: "#1d4ed8" }}>A</span>
              <div className="h-1 w-5 rounded-full mt-0.5 bg-blue-600" />
            </button>
            {showColorPicker === "text" && (
              <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-52">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Màu chữ</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      onMouseDown={(e) => { e.preventDefault(); handleColor(c, "text"); }}
                      className="w-6 h-6 rounded-full border-2 border-white shadow hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              title="Màu nền"
              onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(showColorPicker === "bg" ? null : "bg"); }}
              className="flex flex-col items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
            >
              <span className="text-[13px] leading-none">🎨</span>
            </button>
            {showColorPicker === "bg" && (
              <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-52">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Màu nền</p>
                <div className="flex flex-wrap gap-1.5">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onMouseDown={(e) => { e.preventDefault(); handleColor(c, "bg"); }}
                      className="w-6 h-6 rounded-md border border-gray-200 shadow hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Formatting groups */}
          {TOOLBAR.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {group.map((btn) => {
                const isActive = btn.check ? activeCommands.has(btn.check) : false;
                return (
                  <button
                    key={btn.label}
                    title={btn.label}
                    onMouseDown={(e) => { e.preventDefault(); handleToolbarBtn(btn); }}
                    className={cn(
                      "w-7 h-7 rounded flex items-center justify-center text-sm transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-bold"
                        : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                    )}
                  >
                    {btn.icon}
                  </button>
                );
              })}
              {gi < TOOLBAR.length - 1 && (
                <div className="w-px h-5 bg-gray-200 mx-1" />
              )}
            </div>
          ))}

          {/* AI gợi ý button */}
          <div className="ml-auto">
            <button
              onMouseDown={(e) => { e.preventDefault(); setShowAiTip((v) => !v); }}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI gợi ý
            </button>
          </div>
        </div>

        {/* ── Content Editable Area ── */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveCommands}
          onMouseUp={updateActiveCommands}
          onKeyDown={handleKeyDown}
          onClick={() => setShowColorPicker(null)}
          data-placeholder="Nhập mô tả công việc..."
          className={cn(
            "min-h-[220px] p-4 text-sm text-gray-700 leading-relaxed outline-none",
            "prose prose-sm max-w-none",
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-2",
            "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-2",
            "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-1",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1",
            "[&_a]:text-blue-600 [&_a]:underline",
            "[&_strong]:font-bold [&_em]:italic",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
          )}
        />

        {/* ── Status bar ── */}
        <div className="flex items-center justify-between bg-gray-50 border-t border-gray-200 px-4 py-1.5">
          <span className="text-[11px] text-gray-400">
            {wordCount} từ
          </span>
          <span className="text-[11px] text-gray-400">
            Ctrl+B Bold · Ctrl+I Italic · Ctrl+U Underline
          </span>
        </div>
      </div>

      {/* ── AI Suggestion Banner ── */}
      {showAiTip && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-blue-800 mb-0.5">
              AI gợi ý cải thiện mô tả công việc
            </div>
            <p className="text-xs text-blue-600 leading-relaxed">
              Bạn có thể thêm các từ khóa như: <strong>performance</strong>, <strong>responsive</strong>,{" "}
              <strong>component</strong>, <strong>state management</strong> để tăng khả năng tiếp cận ứng viên phù hợp.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={applyAiSuggestion}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Áp dụng gợi ý
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
