"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";
import { FormProps } from "../sections/types";

export default function SkillForm({ data, setData }: FormProps) {
  const skillCore = data.skillCore || [];
  const skillSoft = data.skillSoft || [];
  const [inputCore, setInputCore] = useState("");
  const [inputSoft, setInputSoft] = useState("");

  const addSkillCore = () => {
    const val = inputCore.trim();
    if (val && !skillCore.includes(val)) {
      setData({
        ...data,
        skillCore: [...skillCore, val],
      });
      setInputCore("");
    }
  };
const addSkillSoft = () => {
    const val = inputSoft.trim();
    if (val && !skillSoft.includes(val)) {
      setData({
        ...data,
        skillSoft: [...skillSoft, val],
      });
      setInputSoft("");
    }
  };
  const removeSkillCore = (s: string) =>
    setData({
      ...data,
      skillCore: skillCore.filter((k: string) => k !== s),
    });
 const removeSkillSoft = (s: string) =>
    setData({
      ...data,
      skillSoft: skillSoft.filter((k: string) => k !== s),
    });
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Kỹ năng cứng</Label>
        <div className="flex gap-2">
          <Input
            value={inputCore}
            onChange={(e) => setInputCore(e.target.value)}
            placeholder="VD: React, Python, Quản lý dự án..."
            onKeyDown={(e) => e.key === "Enter" && addSkillCore()}
          />
          <Button
            type="button"
            onClick={addSkillCore}
            className="bg-rose-500 hover:bg-rose-600 text-white shrink-0"
          >
            + Thêm
          </Button>
        </div>
      </div>
      {skillCore.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skillCore.map((s : string) => (
            <Badge key={s} onClick={() => removeSkillCore(s)}>
              {s}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Kỹ năng mềm</Label>
        <div className="flex gap-2">
          <Input
            value={inputSoft}
            onChange={(e) => setInputSoft(e.target.value)}
            placeholder="VD: React, Python, Quản lý dự án..."
            onKeyDown={(e) => e.key === "Enter" && addSkillSoft()}
          />
          <Button
            type="button"
            onClick={addSkillSoft}
            className="bg-rose-500 hover:bg-rose-600 text-white shrink-0"
          >
            + Thêm
          </Button>
        </div>
      </div>
      {skillSoft.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skillSoft.map((s : string) => (
            <Badge key={s} onClick={() => removeSkillSoft(s)}>
              {s}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
