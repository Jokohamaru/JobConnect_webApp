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
import { useState } from "react";
export default function AwardForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên giải thưởng / Thành tích</Label>
        <Input placeholder="VD: Nhân viên xuất sắc năm 2023" />
      </div>
      <div className="space-y-1.5">
        <Label>Tổ chức trao giải</Label>
        <Input placeholder="VD: FPT Corporation" />
      </div>
      <div className="space-y-1.5">
        <Label>Thời gian</Label>
        <Input type="month" />
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả (tùy chọn)</Label>
        <Textarea placeholder="Lý do nhận giải, ý nghĩa của giải thưởng..." />
      </div>
    </div>
  );
}
