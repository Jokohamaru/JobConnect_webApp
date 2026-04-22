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
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { FormProps } from "../sections/types";

export default function CertForm({ data, setData }: FormProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên chứng chỉ</Label>
        <Input value={data.name} onChange={(e) => setData({...data, name: e.target.value})} placeholder="VD: AWS Certified Developer" />
      </div>
      <div className="space-y-1.5">
        <Label>Tổ chức cấp</Label>
        <Input value={data.organization} onChange={(e) => setData({...data, organization: e.target.value})} placeholder="VD: Amazon Web Services" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Ngày cấp</Label>
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
          <Label>Ngày hết hạn (nếu có)</Label>
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
        <Label>Mã chứng chỉ / URL (tùy chọn)</Label>
        <Input value={data.urlLink} onChange={(e) => setData({...data,urlLink: e.target.value})} placeholder="Credential ID hoặc link xác minh" />
      </div>
    </div>
  );
}
