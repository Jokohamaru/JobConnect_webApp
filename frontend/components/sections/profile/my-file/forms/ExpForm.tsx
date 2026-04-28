"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Plus, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const emptyItem = {
  company: "",
  position: "",
  descrip: "",
  startYear: undefined as Date | undefined,
  endYear: undefined as Date | undefined,
};

export default function ExpForm({ data, setData }: any) {
  const [expItem, setExpItem] = useState({ ...emptyItem });
  const [isCurrent, setIsCurrent] = useState(false);

  const handleAdd = () => {
    if (!expItem.company || !expItem.position) return;
    const safeData = Array.isArray(data) ? data : [];
    setData([...safeData, expItem]);
    setExpItem({ ...emptyItem });
    setIsCurrent(false);
  };

  const handleRemove = (index: number) => {
    const safeData = Array.isArray(data) ? data : [];
    setData(safeData.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Added experiences */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kinh nghiệm đã thêm</p>
          <div className="space-y-2">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-violet-50 border border-violet-100 rounded-xl relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.company}</p>
                  <p className="text-xs text-gray-500">{item.position}</p>
                  {(item.startYear || item.endYear) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.startYear ? format(new Date(item.startYear), "MM/yyyy") : "?"} –{" "}
                      {item.endYear ? format(new Date(item.endYear), "MM/yyyy") : "Hiện tại"}
                    </p>
                  )}
                  {item.descrip && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.descrip}</p>}
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New experience form */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-violet-500" />
          Thêm kinh nghiệm mới
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên công ty <span className="text-red-400">*</span></Label>
            <Input
              value={expItem.company}
              onChange={(e) => setExpItem({ ...expItem, company: e.target.value })}
              placeholder="VD: Google, FPT Software..."
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vị trí / Chức danh <span className="text-red-400">*</span></Label>
            <Input
              value={expItem.position}
              onChange={(e) => setExpItem({ ...expItem, position: e.target.value })}
              placeholder="VD: Senior Frontend Developer"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Từ tháng/năm</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-violet-300 transition-colors", !expItem.startYear && "text-gray-400")}>
                    {expItem.startYear ? format(expItem.startYear, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={expItem.startYear} onSelect={(d) => setExpItem({ ...expItem, startYear: d })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đến tháng/năm</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    disabled={isCurrent}
                    className={cn(
                      "w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-violet-300 transition-colors",
                      !expItem.endYear && "text-gray-400",
                      isCurrent && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {isCurrent ? "Hiện tại" : expItem.endYear ? format(expItem.endYear, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={expItem.endYear} onSelect={(d) => setExpItem({ ...expItem, endYear: d })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-violet-50 rounded-xl">
            <Checkbox
              id="currentJob"
              checked={isCurrent}
              onCheckedChange={(v) => {
                setIsCurrent(!!v);
                if (v) setExpItem({ ...expItem, endYear: undefined });
              }}
              className="border-violet-300 data-[state=checked]:bg-violet-500"
            />
            <label htmlFor="currentJob" className="text-sm text-gray-600 cursor-pointer select-none">
              Đây là công việc hiện tại của tôi
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả công việc</Label>
            <Textarea
              value={expItem.descrip}
              onChange={(e) => setExpItem({ ...expItem, descrip: e.target.value })}
              placeholder="Mô tả nhiệm vụ, dự án và thành tích đạt được..."
              className="min-h-[90px] rounded-xl border-gray-200 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          type="button"
          className="w-full bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm kinh nghiệm
        </Button>
      </div>
    </div>
  );
}
