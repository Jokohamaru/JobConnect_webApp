"use client";

import { useState } from "react";
import { FORM_MAP } from "./formMap";
import SectionDialog from "./SectionDialg";
import { SectionKey, SECTIONS } from "./sections/types";
import SectionItem from "./SectionItem";

export interface CVData {
  intro: { title: string };
  edu: {
    school: string;
    major: string;
    degree: string;
    descrip: string;
    startYear?: Date;
    endYear?: Date;
  }[];
  exp: { company: string; position: string; descrip: string; startYear?: Date; endYear?: Date }[];
  skill: { skillCore: string[]; skillSoft: string[] };
  lang: { name: string; level: string; cert?: string }[];
  proj: { name: string; role: string; descrip: string; urlLink: string; fromDate?: Date; toDate?: Date }[];
  cert: { name: string; organization: string; urlLink: string; startYear?: Date; endYear?: Date }[];
  award: { name: string; organization: string; descrip: string; year?: Date }[];
}

export function CVSections() {
  const [open, setOpen] = useState<SectionKey | null>(null);
  const activeSection = SECTIONS.find((s) => s.key === open);

  const [cvData, setCvData] = useState<CVData>({
    intro: { title: "" },
    edu: [],
    exp: [],
    skill: { skillCore: [], skillSoft: [] },
    lang: [],
    proj: [],
    cert: [],
    award: [],
  });

  return (
    <>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Thông tin CV</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {SECTIONS.filter(s => {
            const d = cvData[s.key as keyof typeof cvData];
            if (s.key === 'intro') return (d as any).title;
            if (s.key === 'skill') return (d as any).skillCore?.length > 0;
            return Array.isArray(d) && d.length > 0;
          }).length}/{SECTIONS.length} mục đã điền
        </span>
      </div>

      {/* Grid of section cards */}
      <div className="grid grid-cols-1 gap-3">
        {SECTIONS.map((s) => (
          <SectionItem
            key={s.key}
            data={cvData[s.key as keyof typeof cvData]}
            section={s}
            onClick={() => setOpen(s.key)}
          />
        ))}
      </div>

      {/* Dialog */}
      <SectionDialog
        open={!!open}
        onClose={() => setOpen(null)}
        section={activeSection}
      >
        {open &&
          FORM_MAP[open]({
            data: cvData[open],
            setData: (val: any) =>
              setCvData((prev) => ({
                ...prev,
                [open]: val,
              })),
          })}
      </SectionDialog>
    </>
  );
}
