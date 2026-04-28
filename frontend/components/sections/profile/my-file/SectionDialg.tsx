"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Section } from "./sections/types";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  section?: Section;
  children: React.ReactNode;
}

export default function SectionDialog({ open, onClose, section, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-500 rounded-t-2xl shrink-0">
          <DialogTitle className="flex items-center gap-3 text-white">
            {/* [&_svg]:!text-white force override màu icon từ types.tsx */}
            <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 [&_svg]:!text-white [&_svg]:w-5 [&_svg]:h-5">
              {section?.icon}
            </span>
            <div>
              <p className="font-bold text-lg leading-tight">{section?.title}</p>
              <p className="text-xs text-blue-100 font-normal mt-0.5">{section?.desc}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50/80 rounded-b-2xl shrink-0 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer"
          >
            Huỷ
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-md cursor-pointer"
            onClick={onClose}
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}