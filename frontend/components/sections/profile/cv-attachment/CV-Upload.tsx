"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export function CVUpload() {
  return (
    <Card className="bg-white">
      <CardHeader className="">
        <CardTitle className="text-xl font-semibold">CV của bạn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground text-gray-400">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <span>Tạo CV chuyên nghiệp với công cụ CV Builder</span>
        </div>

        <Link href="/cv">
          <Button
            variant="outline"
            className="gap-2 bg-blue-200 border-blue-400 text-blue-500 font-bold hover:bg-blue-50 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            Tạo CV mới
          </Button>
        </Link>

        <p className="text-muted-foreground">
          Sử dụng CV Builder để tạo CV chuyên nghiệp với nhiều mẫu đẹp và tối ưu cho ATS
        </p>
      </CardContent>
    </Card>
  );
}