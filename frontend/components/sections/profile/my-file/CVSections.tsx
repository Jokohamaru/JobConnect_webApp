"use client";

import { useState } from "react";

import SectionItem from "./SectionItem";

import { FORM_MAP } from "./formMap";
import SectionDialog from "./SectionDialg";
import { SectionKey, SECTIONS } from "./sections/types";

export function CVSections() {
  const [open, setOpen] = useState<SectionKey | null>(null);

  const activeSection = SECTIONS.find((s) => s.key === open);
  const [cvData, setCvData] = useState({
    intro: { title: "" },
    edu: { school: "" },
    exp: { company: "", position: "" },
  });
  return (
    <>
      {/* LIST */}
      <div className="flex flex-col gap-5 ">
        {SECTIONS.map((s) => (
          <SectionItem key={s.key} section={s} onClick={() => setOpen(s.key)} />
        ))}
      </div>

      {/* DIALOG */}
      <SectionDialog
        open={!!open}
        onClose={() => setOpen(null)}
        section={activeSection}
      >
        {open && FORM_MAP[open]}
      </SectionDialog>
    </>
  );
}
