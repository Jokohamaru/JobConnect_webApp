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


interface Props {
  open: boolean;
  onClose: () => void;
  section?: Section;
  children: React.ReactNode;
}

export default function SectionDialog({
  open,
  onClose,
  section,
  children,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {section?.icon}
            {section?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">{children}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button className="bg-blue-500 text-white" onClick={onClose}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}