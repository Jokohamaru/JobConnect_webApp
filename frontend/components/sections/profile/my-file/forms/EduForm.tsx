"use client";

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
import { FormProps } from "../sections/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X, Plus, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";


const emptyItem = {
  school: "",
  major: "",
  degree: "",
  descrip: "",
  startYear: undefined as Date | undefined,
  endYear: undefined as Date | undefined,
};

export default function EduForm({ data, setData }: FormProps) {
  const [eduItem, setEduItem] = useState({ ...emptyItem });

  const handleAdd = () => {
    if (!eduItem.school || !eduItem.major) return;
    const safeData = Array.isArray(data) ? data : [];
    setData([...safeData, eduItem]);
    setEduItem({ ...emptyItem });
  };

  const handleRemove = (index: number) => {
    const safeData = Array.isArray(data) ? data : [];
    setData(safeData.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Added educations */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Học vấn đã thêm</p>
          <div className="space-y-2">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.school}</p>
                  <p className="text-xs text-gray-500">
                    {item.major}{item.degree && ` · ${item.degree}`}
                  </p>
                  {(item.startYear || item.endYear) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.startYear ? format(new Date(item.startYear), "MM/yyyy") : "?"} –{" "}
                      {item.endYear ? format(new Date(item.endYear), "MM/yyyy") : "Nay"}
                    </p>
                  )}
                  {item.descrip && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.descrip}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="shrink-0 w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New education form */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-500" />
          Thêm học vấn mới
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trường / Cơ sở đào tạo <span className="text-red-400">*</span></Label>
            <Input
              value={eduItem.school}
              onChange={(e) => setEduItem({ ...eduItem, school: e.target.value })}
              placeholder="VD: Đại học Bách Khoa Hà Nội"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chuyên ngành <span className="text-red-400">*</span></Label>
            <Input
              value={eduItem.major}
              onChange={(e) => setEduItem({ ...eduItem, major: e.target.value })}
              placeholder="VD: Công nghệ thông tin"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bằng cấp / Trình độ</Label>
            <Select value={eduItem.degree} onValueChange={(v) => setEduItem({ ...eduItem, degree: v })}>
              <SelectTrigger className="rounded-xl border-gray-200">
                <SelectValue placeholder="-- Chọn bằng cấp --" />
              </SelectTrigger>
              <SelectContent>
                {["Trung cấp", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Năm bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full flex items-center justify-between border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-indigo-300 h-auto font-normal", !eduItem.startYear && "text-gray-400")}
                  >
                    {eduItem.startYear ? format(eduItem.startYear, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={eduItem.startYear} onSelect={(d) => setEduItem({ ...eduItem, startYear: d })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Năm kết thúc</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full flex items-center justify-between border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-indigo-300 h-auto font-normal", !eduItem.endYear && "text-gray-400")}
                  >
                    {eduItem.endYear ? format(eduItem.endYear, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={eduItem.endYear} onSelect={(d) => setEduItem({ ...eduItem, endYear: d })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả thêm (tùy chọn)</Label>
            <Textarea
              value={eduItem.descrip}
              onChange={(e) => setEduItem({ ...eduItem, descrip: e.target.value })}
              placeholder="Thành tích nổi bật, luận văn, hoạt động..."
              className="min-h-[80px] rounded-xl border-gray-200 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          type="button"
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm học vấn
        </Button>
      </div>
    </div>
  );
}
