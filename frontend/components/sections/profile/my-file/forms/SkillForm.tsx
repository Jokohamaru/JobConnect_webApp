"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { FormProps } from "../sections/types";

export default function SkillForm({ data, setData }: FormProps) {
  const skillCore: string[] = data?.skillCore ?? [];
  const skillSoft: string[] = data?.skillSoft ?? [];
  const [inputCore, setInputCore] = useState("");
  const [inputSoft, setInputSoft] = useState("");

  const addSkillCore = () => {
    const val = inputCore.trim();
    if (val && !skillCore.includes(val)) {
      setData({ ...data, skillCore: [...skillCore, val] });
      setInputCore("");
    }
  };

  const addSkillSoft = () => {
    const val = inputSoft.trim();
    if (val && !skillSoft.includes(val)) {
      setData({ ...data, skillSoft: [...skillSoft, val] });
      setInputSoft("");
    }
  };

  const removeSkillCore = (s: string) =>
    setData({ ...data, skillCore: skillCore.filter((k) => k !== s) });

  const removeSkillSoft = (s: string) =>
    setData({ ...data, skillSoft: skillSoft.filter((k) => k !== s) });

  return (
    <div className="space-y-6">
      {/* Kỹ năng cứng */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" />
          Kỹ năng chuyên môn
        </p>

        <div className="flex gap-2">
          <Input
            value={inputCore}
            onChange={(e) => setInputCore(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillCore(); } }}
            placeholder="VD: React, Node.js, Python..."
            className="rounded-xl border-gray-200 flex-1"
          />
          <Button
            type="button"
            onClick={addSkillCore}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shrink-0 px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {skillCore.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skillCore.map((s) => (
              <div
                key={s}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
              >
                <span>{s}</span>
                {/* Button X riêng biệt với stopPropagation */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSkillCore(s);
                  }}
                  className="w-4 h-4 rounded-full hover:bg-emerald-200 hover:text-red-500 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kỹ năng mềm */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-500" />
          Kỹ năng mềm
        </p>

        <div className="flex gap-2">
          <Input
            value={inputSoft}
            onChange={(e) => setInputSoft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillSoft(); } }}
            placeholder="VD: Giao tiếp, Làm việc nhóm, Quản lý..."
            className="rounded-xl border-gray-200 flex-1"
          />
          <Button
            type="button"
            onClick={addSkillSoft}
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl shrink-0 px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {skillSoft.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skillSoft.map((s) => (
              <div
                key={s}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
              >
                <span>{s}</span>
                {/* Button X riêng biệt với stopPropagation */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSkillSoft(s);
                  }}
                  className="w-4 h-4 rounded-full hover:bg-teal-200 hover:text-red-500 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
