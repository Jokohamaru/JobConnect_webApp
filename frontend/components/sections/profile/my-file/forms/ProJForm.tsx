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

import { X } from "lucide-react";

import { FormProps } from "../sections/types";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
export default function ProjForm({ data, setData }: FormProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên dự án</Label>
        <Input value={data.name} onChange={(e) => setData({...data, name: e.target.value})} placeholder="VD: Hệ thống quản lý bán hàng online" />
      </div>
      <div className="space-y-1.5">
        <Label>Vai trò của bạn</Label>
        <Input value={data.role} onChange={(e) => setData({...data, role: e.target.value})} placeholder="VD: Lead Developer, UX Designer..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Từ tháng/năm</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                  !fromDate && "text-muted-foreground",
                )}
              >
                {fromDate ? format(fromDate, "MM/yyyy") : "Chọn thời gian"}
                <CalendarIcon className="w-4 h-4 opacity-60" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(date) => {
                  setFromDate(date);
                  setData({ ...data, fromDate: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label>Đến tháng/năm</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                  !toDate && "text-muted-foreground",
                )}
              >
                {toDate ? format(toDate, "MM/yyyy") : "Chọn thời gian"}
                <CalendarIcon className="w-4 h-4 opacity-60" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(date) => {
                  setToDate(date);
                  setData({ ...data, toDate: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả dự án</Label>
        <Textarea
        value={data.descrip} onChange={(e) => setData({...data, descrip: e.target.value})}
          placeholder="Mục tiêu, công nghệ sử dụng, kết quả đạt được..."
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Đường dẫn dự án (tùy chọn)</Label>
        <Input  value={data.urlLink} onChange={(e) => setData({...data, urlLink: e.target.value})}  type="url" placeholder="https://github.com/..." />
      </div>
    </div>
  );
}
