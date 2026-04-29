"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Plus, Trophy } from "lucide-react";
import { useState } from "react";
import { FormProps } from "../sections/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const emptyItem = {
  name: "",
  organization: "",
  descrip: "",
  year: undefined as Date | undefined,
};

export default function AwardForm({ data, setData }: FormProps) {
  const [awardItem, setAwardItem] = useState({ ...emptyItem });

  const handleAdd = () => {
    if (!awardItem.name || !awardItem.organization) return;
    const safeData = Array.isArray(data) ? data : [];
    setData([...safeData, awardItem]);
    setAwardItem({ ...emptyItem });
  };

  const handleRemove = (index: number) => {
    const safeData = Array.isArray(data) ? data : [];
    setData(safeData.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Added awards */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Giải thưởng đã thêm</p>
          <div className="space-y-2">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-yellow-50 border border-yellow-100 rounded-xl relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.organization}</p>
                  {item.year && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(item.year), "MM/yyyy")}
                    </p>
                  )}
                  {item.descrip && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.descrip}</p>}
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

      {/* New award form */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-yellow-500" />
          Thêm giải thưởng mới
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên giải thưởng / Thành tích <span className="text-red-400">*</span></Label>
            <Input
              value={awardItem.name}
              onChange={(e) => setAwardItem({ ...awardItem, name: e.target.value })}
              placeholder="VD: Nhân viên xuất sắc năm 2023"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổ chức trao giải <span className="text-red-400">*</span></Label>
            <Input
              value={awardItem.organization}
              onChange={(e) => setAwardItem({ ...awardItem, organization: e.target.value })}
              placeholder="VD: FPT Corporation"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thời gian nhận giải</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full flex items-center justify-between border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-yellow-300 h-auto font-normal", !awardItem.year && "text-gray-400")}
                >
                  {awardItem.year ? format(awardItem.year, "MM/yyyy") : "Chọn thời gian"}
                  <CalendarIcon className="w-4 h-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={awardItem.year}
                  onSelect={(d) => setAwardItem({ ...awardItem, year: d })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả (tùy chọn)</Label>
            <Textarea
              value={awardItem.descrip}
              onChange={(e) => setAwardItem({ ...awardItem, descrip: e.target.value })}
              placeholder="Lý do nhận giải, ý nghĩa của thành tích..."
              className="min-h-[80px] rounded-xl border-gray-200 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          type="button"
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-600 hover:to-amber-500 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm giải thưởng
        </Button>
      </div>
    </div>
  );
}
