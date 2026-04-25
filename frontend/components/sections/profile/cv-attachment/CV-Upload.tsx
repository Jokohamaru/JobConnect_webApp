"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

export function CVUpload() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileRef.current?.click();
  };

  return (
    <Card className="bg-white">
      <CardHeader className="">
        <CardTitle className="text-xl font-semibold">CV của bạn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground text-gray-400">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <span>Bạn chưa đính kèm CV nào</span>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".doc,.docx,.pdf"
          className="hidden"
        />

        <Button
          variant="outline"
          onClick={handleUpload}
          className="gap-2 bg-blue-200 border-blue-400 text-blue-500 font-bold  hover:bg-blue-50 hover:text-blue-600"
        >
          <Upload className="h-4 w-4" />
          Tải CV lên
        </Button>

        <p className=" text-muted-foreground">
          Hỗ trợ định dạng .doc, .docx hoặc .pdf, dưới 3MB và không chứa mật
          khẩu bảo vệ
        </p>
      </CardContent>
    </Card>
  );
}