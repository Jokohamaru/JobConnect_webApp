"use client";
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
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
export default function ExpForm({ data, setData }: any) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isCurrent, setIsCurrent] = useState(false);
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên công ty</Label>
        <Input
          placeholder="Tên công ty"
          value={data.company}
          onChange={(e) => setData({ ...data, company: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Vị trí / Chức danh</Label>
        <Input  value={data.position}
          onChange={(e) => setData({ ...data, position: e.target.value })} placeholder="VD: Senior Frontend Developer" />
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
                  setData({ ...data, startYear: date });
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
                disabled={isCurrent}
                className={cn(
                  "w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm",
                  !toDate && "text-muted-foreground",
                  isCurrent && "opacity-40",
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
      <div className="flex items-center gap-2">
        <Checkbox
          id="currentJob"
          checked={isCurrent}
          onCheckedChange={(v) => setIsCurrent(!!v)}
        />
        <label
          htmlFor="currentJob"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Đây là công việc hiện tại của tôi
        </label>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả công việc</Label>
        <Textarea
         value={data.descrip}
          onChange={(e) => setData({ ...data, descrip: e.target.value })}
          placeholder="Mô tả nhiệm vụ, dự án và thành tích đạt được..."
          className="min-h-25"
        />
      </div>
    </div>
  );
}
