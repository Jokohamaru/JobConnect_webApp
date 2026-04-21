"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, AlertCircle, SquarePen } from "lucide-react";

interface BasicInfoData {
  fullName: string;
  phone: string;
  desiredLocation: string;
}
function FloatingInput({
  label,

  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="relative border border-gray-300 rounded-md px-3 pt-5 pb-2 focus-within:border-blue-500 transition-colors">
      <label className="absolute top-1.5 left-3 text-xs text-gray-400">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}

        value={value}
        onChange={onChange}
        className="w-full text-sm text-gray-800 outline-none bg-transparent"
      />
    </div>
  );
}
export function BasicInfo() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BasicInfoData>({
    fullName: "Duy Trịnh",
    phone: "",
    desiredLocation: "",
  });
  const [form, setForm] = useState<BasicInfoData>(data);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Thông tin cơ bản
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
          <div className="grid grid-cols-[160px_1fr] gap-x-20 gap-y-3 text-sm">
            <span className="text-muted-foreground">Họ và Tên</span>
            <span className="font-bold">
              {data.fullName || <MissingInfo text="Thêm thông tin" />}
            </span>

            <span className="text-muted-foreground">Số điện thoại</span>
            <span className="font-bold">
              {data.phone || <MissingInfo text="Thêm thông tin" />}
            </span>

            <span className="text-muted-foreground">
              Nơi làm việc mong muốn
            </span>
            <span className="font-bold">
              {data.desiredLocation || <MissingInfo text="Thêm thông tin" />}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="border-b-2 pb-4 border-gray-400">Thông tin cơ bản</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <FloatingInput
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
                label={"Họ Và Tên"}
              />
            </div>
            <div className="space-y-1.5">
              <FloatingInput
                label={"Số điện thoại"}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="space-y-1.5">
              <FloatingInput
                label="Nơi làm việc mong muốn"
                value={form.desiredLocation}
                onChange={(e) =>
                  setForm({ ...form, desiredLocation: e.target.value })
                }
                placeholder="Nhập nơi làm việc mong muốn"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className=" hover:bg-gray-300 cursor-pointer" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-blue-400 hover:bg-blue-300 px-5 cursor-pointer" onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MissingInfo({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-1 text-amber-500">
      <AlertCircle className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}
