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
  };
  exp: { company: string; position: string; descrip: string};
  skill: { skillCore: string[]; skillSoft: string[] };
  lang: {
    name: string;
    level: string;
    cert?: string;
  }[];
  proj: { name: string; role: string; descrip: string; urlLink: string };
  cert: { name: string; organization: string; urlLink: string };
  award: { name: string; organization: string, descrip: string };
}
export function CVSections() {
  const [open, setOpen] = useState<SectionKey | null>(null);

  const activeSection = SECTIONS.find((s) => s.key === open);

  const [cvData, setCvData] = useState<CVData>({
    intro: { title: "" },
    edu: {
      school: "",
      major: "",
      degree: "",
      descrip: "",

    },
    exp: { company: "", position: "", descrip: "" },
    skill: { skillCore: [], skillSoft: [] },
    lang: [],
    proj: {
      name: "",
      role: "",
      descrip: "",
      urlLink: ""
    },
    cert: {
      name: "",
      organization: "",
      urlLink: ""
    },
    award: {
      name: "",
      organization: "",
      descrip: ""
    },
  });
  return (
    <>
      {/* LIST */}
      <div className="flex flex-col gap-5 ">
        {SECTIONS.map((s) => (
          <SectionItem
            key={s.key}
            data={cvData[s.key as keyof typeof cvData]}
            section={s}
            onClick={() => setOpen(s.key)}
          />
        ))}
      </div>

      {/* DIALOG */}
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
