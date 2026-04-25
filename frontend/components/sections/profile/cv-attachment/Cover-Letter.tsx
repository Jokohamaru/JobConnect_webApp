"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, SquarePen } from "lucide-react";

export function CoverLetter() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState("");

  const handleSave = () => {
    setContent(draft);
    setOpen(false);
  };

  const handleOpen = () => {
    setDraft(content);
    setOpen(true);
  };

  return (
    <>
      <Card className="bg-white">
        <CardHeader className=" flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Thư xin việc</CardTitle>
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
          {content ? (
            <p className="text-sm whitespace-pre-line">{content}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Giới thiệu bản thân và lý do vì sao bạn sẽ là lựa chọn tuyển dụng
              tuyệt vời
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thư xin việc</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Giới thiệu bản thân và lý do vì sao bạn sẽ là lựa chọn tuyển dụng tuyệt vời..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1.5 text-right">
              {draft.length} ký tự
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="hover:bg-gray-300 cursor-pointer" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-blue-400 hover:bg-blue-300 px-5 cursor-pointer" onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}