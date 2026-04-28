"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X, Plus, Award } from "lucide-react";
import { FormProps } from "../sections/types";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const emptyItem = {
  name: "",
  organization: "",
  urlLink: "",
  startYear: undefined as Date | undefined,
  endYear: undefined as Date | undefined,
};

export default function CertForm({ data, setData }: FormProps) {
  const [certItem, setCertItem] = useState({ ...emptyItem });

  const handleAdd = () => {
    if (!certItem.name || !certItem.organization) return;
    const safeData = Array.isArray(data) ? data : [];
    setData([...safeData, certItem]);
    setCertItem({ ...emptyItem });
  };

  const handleRemove = (index: number) => {
    const safeData = Array.isArray(data) ? data : [];
    setData(safeData.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Added certs */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chứng chỉ đã thêm</p>
          <div className="space-y-2">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-pink-50 border border-pink-100 rounded-xl relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.organization}</p>
                  {(item.startYear || item.endYear) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.startYear ? format(new Date(item.startYear), "MM/yyyy") : "?"} –{" "}
                      {item.endYear ? format(new Date(item.endYear), "MM/yyyy") : "Không hết hạn"}
                    </p>
                  )}
                  {item.urlLink && (
                    <a href={item.urlLink} target="_blank" rel="noreferrer" className="text-xs text-pink-500 hover:underline truncate block">
                      {item.urlLink}
                    </a>
                  )}
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

      {/* New cert form */}
      <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="w-4 h-4 text-pink-500" />
          Thêm chứng chỉ mới
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên chứng chỉ <span className="text-red-400">*</span></Label>
            <Input
              value={certItem.name}
              onChange={(e) => setCertItem({ ...certItem, name: e.target.value })}
              placeholder="VD: AWS Certified Developer"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổ chức cấp <span className="text-red-400">*</span></Label>
            <Input
              value={certItem.organization}
              onChange={(e) => setCertItem({ ...certItem, organization: e.target.value })}
              placeholder="VD: Amazon Web Services"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày cấp</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-pink-300 transition-colors", !certItem.startYear && "text-gray-400")}>
                    {certItem.startYear ? format(certItem.startYear, "MM/yyyy") : "Chọn thời gian"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={certItem.startYear} onSelect={(d) => setCertItem({ ...certItem, startYear: d })} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày hết hạn</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-pink-300 transition-colors", !certItem.endYear && "text-gray-400")}>
                    {certItem.endYear ? format(certItem.endYear, "MM/yyyy") : "Không hết hạn"}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={certItem.endYear} onSelect={(d) => setCertItem({ ...certItem, endYear: d })} initialFocus /></PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã chứng chỉ / URL xác minh</Label>
            <Input
              value={certItem.urlLink}
              onChange={(e) => setCertItem({ ...certItem, urlLink: e.target.value })}
              placeholder="Credential ID hoặc link xác minh"
              className="rounded-xl border-gray-200"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          type="button"
          className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm chứng chỉ
        </Button>
      </div>
    </div>
  );
}
