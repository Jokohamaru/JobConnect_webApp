'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormProps } from "../sections/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
export default function EduForm({data, setData} : FormProps) {
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Trường / Cơ sở đào tạo</Label>
        <Input value={data.school} onChange={(e) => setData({...data, school: e.target.value})} placeholder="VD: Đại học Bách Khoa Hà Nội" />
      </div>
      <div className="space-y-1.5">
        <Label>Chuyên ngành</Label>
        <Input value={data.major} onChange={(e) => setData({...data, major: e.target.value})} placeholder="VD: Công nghệ thông tin" />
      </div>
      <div className="space-y-1.5">
        <Label>Bằng cấp / Trình độ</Label>
        <Select value={data.degree} onValueChange={(value) => setData({ ...data, degree: value })}>
          <SelectTrigger>
            <SelectValue  placeholder="-- Chọn --" />
          </SelectTrigger>
          <SelectContent>
            {["Trung cấp", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ"].map(
              (d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Năm bắt đầu</Label>
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
                  setData({ ...data, startYear: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label>Năm kết thúc</Label>
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
                  setData({ ...data, endYear: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả thêm (tùy chọn)</Label>
        <Textarea value={data.descrip} onChange={(e) => setData({...data,descrip: e.target.value})} placeholder="Thành tích nổi bật, luận văn, hoạt động..." />
      </div>
    </div>
  );
}