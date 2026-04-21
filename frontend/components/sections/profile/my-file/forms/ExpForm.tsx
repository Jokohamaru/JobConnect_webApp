'use client'
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ExpForm({ data, setData }: any) {
  const [isCurrent, setIsCurrent] = useState(false);
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên công ty</Label>
        <Input placeholder="Tên công ty"
        value={data.company}
        onChange={(e) =>
          setData({ ...data, company: e.target.value })
        }/>
      </div>
      <div className="space-y-1.5">
        <Label>Vị trí / Chức danh</Label>
        <Input placeholder="VD: Senior Frontend Developer" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Từ tháng/năm</Label>
          <Input type="month" />
        </div>
        <div className="space-y-1.5">
          <Label>Đến tháng/năm</Label>
          <Input type="month" disabled={isCurrent} className={cn(isCurrent && "opacity-40")} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="currentJob"
          checked={isCurrent}
          onCheckedChange={(v) => setIsCurrent(!!v)}
        />
        <label htmlFor="currentJob" className="text-sm text-muted-foreground cursor-pointer">
          Đây là công việc hiện tại của tôi
        </label>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả công việc</Label>
        <Textarea
          placeholder="Mô tả nhiệm vụ, dự án và thành tích đạt được..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}