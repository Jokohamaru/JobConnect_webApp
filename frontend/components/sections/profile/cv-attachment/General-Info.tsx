"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, SquarePen } from "lucide-react";

interface GeneralInfoData {
  yearsOfExperience: string;
  currentLevel: string;
  workType: string;
}

const LEVELS = [
  "Intern / Thực tập sinh",
  "Fresher / Junior",
  "Middle",
  "Senior",
  "Lead / Manager",
  "C-level",
];

const WORK_TYPES = [
  "Toàn thời gian",
  "Bán thời gian",
  "Thực tập",
  "Freelance",
  "Remote",
];

export function GeneralInfo() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GeneralInfoData>({
    yearsOfExperience: "",
    currentLevel: "",
    workType: "",
  });
  const [form, setForm] = useState<GeneralInfoData>(data);

  const handleSave = () => {
    setData(form);
    setOpen(false);
  };

  const handleOpen = () => {
    setForm(data);
    setOpen(true);
  };

  return (
    <> 
      <Card className="bg-white">
        <CardHeader className=" flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Thông tin chung
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpen}
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <SquarePen className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[200px_1fr] gap-y-3 gap-x-10 text-sm">
            <span className="text-muted-foreground">Tổng số năm kinh nghiệm</span>
            <span className={data.yearsOfExperience ? "font-bold" : "text-muted-foreground text-gray-400"}>
              {data.yearsOfExperience || "Thêm thông tin"}
            </span>

            <span className="text-muted-foreground">Cấp bậc hiện tại</span>
            <span className={data.currentLevel ? "font-bold" : "text-muted-foreground text-gray-400"}>
              {data.currentLevel || "Thêm thông tin"}
            </span>

            <span className="text-muted-foreground">Hình thức làm việc mong muốn</span>
            <span className={data.workType ? "font-bold" : "text-muted-foreground text-gray-400"}>
              {data.workType || "Thêm thông tin"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="border-b-2 pb-4 border-gray-400">Thông tin chung</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tổng số năm kinh nghiệm</Label>
              <Input
                type="number"
                min={0}
                value={form.yearsOfExperience}
                onChange={(e) =>
                  setForm({ ...form, yearsOfExperience: e.target.value })
                }
                placeholder="Nhập số năm kinh nghiệm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cấp bậc hiện tại</Label>
              <Select
                value={form.currentLevel || undefined}
                onValueChange={(v) => setForm({ ...form, currentLevel: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp bậc" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Hình thức làm việc mong muốn</Label>
              <Select
                value={form.workType || undefined}
                onValueChange={(v) => setForm({ ...form, workType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="hover:bg-gray-300 cursor-pointer" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-blue-400 hover:bg-blue-300 px-5 cursor-pointer">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}