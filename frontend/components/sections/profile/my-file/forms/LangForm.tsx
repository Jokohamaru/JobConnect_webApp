"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";
import { FormProps } from "../sections/types";

export default function LangForm({ data, setData }: FormProps) {
  const [lang, setLang] = useState({
    name: "",
    level: "",
    cert: "",
  });

const addLang = () => {
  if (!lang.name || !lang.level) return;

  const safeData = Array.isArray(data) ? data : [];

  setData([...safeData, lang]);

  setLang({ name: "", level: "", cert: "" });
};

  const removeLang = (index: number) => {
  const safeData = Array.isArray(data) ? data : [];
  setData(safeData.filter((_, i) => i !== index));
};

  return (
    <div className="space-y-4">
      {/* chọn ngôn ngữ */}
      <div className="space-y-1.5">
        <Label>Ngôn ngữ</Label>
        <Select
          value={lang.name}
          onValueChange={(v) => setLang({ ...lang, name: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="-- Chọn ngôn ngữ --" />
          </SelectTrigger>
          <SelectContent>
            {[
              "Tiếng Anh",
              "Tiếng Trung",
              "Tiếng Nhật",
              "Tiếng Hàn",
              "Tiếng Pháp",
              "Tiếng Đức",
              "Khác",
            ].map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* trình độ */}
      <div className="space-y-1.5">
        <Label>Trình độ</Label>
        <Select
          value={lang.level}
          onValueChange={(v) => setLang({ ...lang, level: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="-- Chọn trình độ --" />
          </SelectTrigger>
          <SelectContent>
            {["Cơ bản", "Giao tiếp", "Thành thạo", "Bản ngữ"].map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* chứng chỉ */}
      <Input
        placeholder="VD: IELTS 7.0"
        value={lang.cert}
        onChange={(e) => setLang({ ...lang, cert: e.target.value })}
      />

      {/* button thêm */}
      <Button onClick={addLang} type="button">
        + Thêm
      </Button>

      {/* render list */}
      {data?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.map((l: any, index: number) => (
            <Badge
              key={index}
              className="flex items-center gap-1 cursor-pointer"
            >
              {l.name} - {l.level}
              {l.cert && ` (${l.cert})`}
              <X className="w-3 h-3" onClick={() => removeLang(index)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
