'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

export default function LangForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Ngôn ngữ</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="-- Chọn ngôn ngữ --" />
          </SelectTrigger>
          <SelectContent>
            {["Tiếng Anh", "Tiếng Trung", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Pháp", "Tiếng Đức", "Khác"].map(
              (l) => <SelectItem key={l} value={l}>{l}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Trình độ</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="-- Chọn trình độ --" />
          </SelectTrigger>
          <SelectContent>
            {["Cơ bản (A1–A2)", "Giao tiếp (B1–B2)", "Thành thạo (C1–C2)", "Bản ngữ"].map(
              (l) => <SelectItem key={l} value={l}>{l}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Chứng chỉ (tùy chọn)</Label>
        <Input placeholder="VD: IELTS 7.0, TOEIC 850..." />
      </div>
    </div>
  );
}