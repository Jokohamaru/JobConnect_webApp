
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
export default function CertForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên chứng chỉ</Label>
        <Input placeholder="VD: AWS Certified Developer" />
      </div>
      <div className="space-y-1.5">
        <Label>Tổ chức cấp</Label>
        <Input placeholder="VD: Amazon Web Services" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Ngày cấp</Label>
          <Input type="month" />
        </div>
        <div className="space-y-1.5">
          <Label>Ngày hết hạn (nếu có)</Label>
          <Input type="month" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Mã chứng chỉ / URL (tùy chọn)</Label>
        <Input placeholder="Credential ID hoặc link xác minh" />
      </div>
    </div>
  );
}