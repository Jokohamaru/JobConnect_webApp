
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

export default function ProjForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên dự án</Label>
        <Input placeholder="VD: Hệ thống quản lý bán hàng online" />
      </div>
      <div className="space-y-1.5">
        <Label>Vai trò của bạn</Label>
        <Input placeholder="VD: Lead Developer, UX Designer..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Từ tháng/năm</Label>
          <Input type="month" />
        </div>
        <div className="space-y-1.5">
          <Label>Đến tháng/năm</Label>
          <Input type="month" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả dự án</Label>
        <Textarea
          placeholder="Mục tiêu, công nghệ sử dụng, kết quả đạt được..."
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Đường dẫn dự án (tùy chọn)</Label>
        <Input type="url" placeholder="https://github.com/..." />
      </div>
    </div>
  );
}