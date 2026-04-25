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
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { FormProps } from "../sections/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function AwardForm({data, setData} : FormProps) {
    const [date, setDate] = useState<Date | undefined>();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên giải thưởng / Thành tích</Label>
        <Input value={data.name} onChange={(e) => setData({...data, name: e.target.value})}   placeholder="VD: Nhân viên xuất sắc năm 2023" />
      </div>
      <div className="space-y-1.5">
        <Label>Tổ chức trao giải</Label>
        <Input value={data.organization} onChange={(e) => setData({...data, organization: e.target.value})} placeholder="VD: FPT Corporation" />
      </div>
      <div className="space-y-1.5">
        <Label>Thời gian</Label>
         <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                  !date && "text-muted-foreground",
                )}
              >
                {date ? format(date, "MM/yyyy") : "Chọn thời gian"}
                <CalendarIcon className="w-4 h-4 opacity-60" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  setData({ ...data, year: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả (tùy chọn)</Label>
        <Textarea  value={data.descrip} onChange={(e) => setData({...data,descrip: e.target.value})} placeholder="Lý do nhận giải, ý nghĩa của giải thưởng..." />
      </div>
    </div>
  );
}
