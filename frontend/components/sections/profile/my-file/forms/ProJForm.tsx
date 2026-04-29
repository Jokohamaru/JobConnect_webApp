"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X, Plus, ExternalLink } from "lucide-react";
import { FormProps } from "../sections/types";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const emptyItem = {
  name: "",
  role: "",
  descrip: "",
  urlLink: "",
  fromDate: undefined as Date | undefined,
  toDate: undefined as Date | undefined,
};

export default function ProjForm({ data, setData }: FormProps) {
  const [projItem, setProjItem] = useState({ ...emptyItem });

  const handleAdd = () => {
    if (!projItem.name || !projItem.role) return;
    const safeData = Array.isArray(data) ? data : [];
    setData([...safeData, projItem]);
    setProjItem({ ...emptyItem });
  };

  const handleRemove = (index: number) => {
    const safeData = Array.isArray(data) ? data : [];
    setData(safeData.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Added items list */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dự án đã thêm</p>
          <div className="space-y-2">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-orange-50 border border-orange-100 rounded-xl relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">🚀</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    {item.urlLink && (
                      <a href={item.urlLink} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3 h-3 text-orange-400" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{item.role}</p>
                  {(item.fromDate || item.toDate) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.fromDate ? format(new Date(item.fromDate), "MM/yyyy") : "?"} –{" "}
                      {item.toDate ? format(new Date(item.toDate), "MM/yyyy") : "Nay"}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                  className="shrink-0 w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New item form */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-orange-500" />
          Thêm dự án mới
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên dự án <span className="text-red-400">*</span></Label>
            <Input
              value={projItem.name}
              onChange={(e) => setProjItem({ ...projItem, name: e.target.value })}
              placeholder="VD: Hệ thống quản lý bán hàng online"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vai trò <span className="text-red-400">*</span></Label>
            <Input
              value={projItem.role}
              onChange={(e) => setProjItem({ ...projItem, role: e.target.value })}
              placeholder="VD: Lead Developer, UX Designer..."
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Từ tháng/năm</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full flex items-center justify-between border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-orange-300 h-auto font-normal", !projItem.fromDate && "text-gray-400")}
                  >
                    {projItem.fromDate ? format(projItem.fromDate, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={projItem.fromDate} onSelect={(d) => setProjItem({ ...projItem, fromDate: d })} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đến tháng/năm</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full flex items-center justify-between border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-orange-300 h-auto font-normal", !projItem.toDate && "text-gray-400")}
                  >
                    {projItem.toDate ? format(projItem.toDate, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={projItem.toDate} onSelect={(d) => setProjItem({ ...projItem, toDate: d })} initialFocus /></PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Link dự án (tùy chọn)</Label>
            <Input
              value={projItem.urlLink}
              onChange={(e) => setProjItem({ ...projItem, urlLink: e.target.value })}
              type="url"
              placeholder="https://github.com/..."
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả dự án</Label>
            <Textarea
              value={projItem.descrip}
              onChange={(e) => setProjItem({ ...projItem, descrip: e.target.value })}
              placeholder="Mục tiêu, công nghệ sử dụng, kết quả đạt được..."
              className="min-h-[90px] rounded-xl border-gray-200 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          type="button"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm dự án
        </Button>
      </div>
    </div>
  );
}
