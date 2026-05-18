"use client";

import { EditableText } from "@/components/cv/EditableText";
import { EditableArea } from "@/components/cv/EditableArea";
import { ImageUpload } from "@/components/cv/ImageUpload";
import { DynamicListSection } from "@/components/cv/DynamicListSection";
import { SectionKey } from "./SectionPanel";
import { COLOR_THEMES, LayoutType } from "./DesignPanel";
import { Mail, Phone, MapPin, LinkIcon, Globe } from "lucide-react";

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  duration: string;
  description: string;
}
export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  major?: string;
  year: string;
  gpa?: string;
  description?: string;
}
export interface SkillItem {
  id: string;
  skill: string;
  level: number;
}
export interface ProjectItem {
  id: string;
  name: string;
  tech: string;
  description: string;
  link: string;
}
export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}
export interface ActivityItem {
  id: string;
  name: string;
  role: string;
  duration: string;
}
export interface AwardItem {
  id: string;
  name: string;
  org: string;
  year: string;
}

export interface CVData {
  avatar: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
  dob: string;
  summary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certificates: CertItem[];
  activities: ActivityItem[];
  awards: AwardItem[];
  hobbies: string;
}

interface CVDocumentProps {
  data: CVData;
  onChange: (data: CVData) => void;
  templateId: number;
  colorIndex: number;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  layout: LayoutType;
  enabledSections: SectionKey[];
}

const uid = () => Math.random().toString(36).slice(2);
const fontSizeMap = { small: "text-xs", medium: "text-sm", large: "text-base" };

function SectionHeading({
  title,
  templateId,
  color,
  oneCol,
}: {
  title: string;
  templateId: number;
  color?: string;
  oneCol?: boolean;
}) {
  if (templateId === 1) {
    return (
      <h3 className="font-bold uppercase tracking-wide text-lg mb-3 pb-1 border-b-[1.5px] mt-6" style={{ color: color || 'black', borderColor: color || 'black' }}>
        {title}
      </h3>
    );
  }
  if (templateId === 2) {
    return (
      <div className="bg-[#f0f2f5] py-2 text-center mb-5 mt-6">
        <h3 className="font-bold uppercase tracking-widest text-base text-gray-700">
          {title}
        </h3>
      </div>
    );
  }
  // Template 3 (Original fallback)
  if (oneCol) {
    return (
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">{title}</h3>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }
  return (
    <h3 className="font-bold uppercase tracking-wide text-sm mb-3 pb-1 border-b-2" style={{ borderColor: color, color }}>
      {title}
    </h3>
  );
}

export function CVDocument({
  data,
  onChange,
  templateId,
  colorIndex,
  fontFamily,
  fontSize,
  layout,
  enabledSections,
}: CVDocumentProps) {
  const theme = COLOR_THEMES[colorIndex];
  const fsClass = fontSizeMap[fontSize];
  const oneCol = layout === "one-column";
  const set = <K extends keyof CVData>(key: K, val: CVData[K]) =>
    onChange({ ...data, [key]: val });

  const updExp = (id: string, f: keyof ExperienceItem, v: string) => set("experiences", data.experiences.map((e) => (e.id === id ? { ...e, [f]: v } : e)));
  const updEdu = (id: string, f: keyof EducationItem, v: string) => set("education", data.education.map((e) => (e.id === id ? { ...e, [f]: v } : e)));
  const updSkill = (id: string, f: keyof SkillItem, v: string | number) => set("skills", data.skills.map((s) => (s.id === id ? { ...s, [f]: v } : s)));
  const updProj = (id: string, f: keyof ProjectItem, v: string) => set("projects", data.projects.map((p) => (p.id === id ? { ...p, [f]: v } : p)));
  const updCert = (id: string, f: keyof CertItem, v: string) => set("certificates", data.certificates.map((c) => (c.id === id ? { ...c, [f]: v } : c)));
  const updAct = (id: string, f: keyof ActivityItem, v: string) => set("activities", data.activities.map((a) => (a.id === id ? { ...a, [f]: v } : a)));
  const updAward = (id: string, f: keyof AwardItem, v: string) => set("awards", data.awards.map((a) => (a.id === id ? { ...a, [f]: v } : a)));

  const renderSection = (key: SectionKey) => {
    if (!enabledSections.includes(key)) return null;

    switch (key) {
      case "summary":
        return (
          <div key="summary" className="mb-5">
            <SectionHeading title="Mục tiêu nghề nghiệp" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <EditableArea
              value={data.summary}
              onChangeText={(v) => set("summary", v)}
              className={`text-gray-800 leading-relaxed w-full ${fsClass}`}
              placeholder="Mô tả mục tiêu nghề nghiệp của bạn..."
            />
          </div>
        );

      case "experience":
        return (
          <div key="experience" className="mb-5">
            <SectionHeading title="Kinh nghiệm làm việc" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.experiences}
              onAdd={() => set("experiences", [...data.experiences, { id: uid(), position: "Vị trí", company: "Tên công ty", duration: "2023 - Nay", description: "Mô tả công việc" }])}
              onRemove={(id) => set("experiences", data.experiences.filter((e) => e.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex gap-4 mb-4">
                      <div className="w-[150px] shrink-0 text-gray-700">
                        <EditableText value={item.duration} onChangeText={(v) => updExp(item.id, "duration", v)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-gray-900 mb-1 text-base">
                          <EditableText value={item.company} onChangeText={(v) => updExp(item.id, "company", v)} />
                          <span className="text-gray-400 font-normal">|</span>
                          <EditableText value={item.position} onChangeText={(v) => updExp(item.id, "position", v)} className="text-gray-700" />
                        </div>
                        <EditableArea value={item.description} onChangeText={(v) => updExp(item.id, "description", v)} className={`text-gray-800 leading-relaxed ${fsClass}`} />
                      </div>
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="mb-4">
                      <div className=" items-start font-bold text-black text-base">
                        <EditableText value={item.company} onChangeText={(v) => updExp(item.id, "company", v)} />
                        <EditableText value={item.duration} onChangeText={(v) => updExp(item.id, "duration", v)} className="font-normal text-black text-sm shrink-0" />
                      </div>
                      <EditableText value={item.position} onChangeText={(v) => updExp(item.id, "position", v)} className="font-bold text-black mb-1" />
                      <EditableArea value={item.description} onChangeText={(v) => updExp(item.id, "description", v)} className={`text-black leading-relaxed whitespace-pre-wrap ${fsClass}`} />
                    </div>
                  );
                }
                // Template 3 (Original)
                return (
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <EditableText value={item.position} onChangeText={(v) => updExp(item.id, "position", v)} className={`font-semibold text-gray-800 ${fsClass}`} />
                      <EditableText value={item.duration} onChangeText={(v) => updExp(item.id, "duration", v)} className={`text-gray-400 text-xs shrink-0`} />
                    </div>
                    <EditableText value={item.company} onChangeText={(v) => updExp(item.id, "company", v)} className={`font-medium ${fsClass}`} style={{ color: theme.primary }} />
                    <EditableArea value={item.description} onChangeText={(v) => updExp(item.id, "description", v)} className={`text-gray-600 mt-1 leading-relaxed ${fsClass}`} />
                  </div>
                );
              }}
            />
          </div>
        );

      case "education":
        return (
          <div key="education" className="mb-5">
            <SectionHeading title="Học vấn" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.education}
              onAdd={() => set("education", [...data.education, { id: uid(), degree: "Bằng cấp", school: "Trường Đại học", major: "Chuyên ngành", year: "2020 - 2024", gpa: "3.5/4.0", description: "" }])}
              onRemove={(id) => set("education", data.education.filter((e) => e.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex gap-4 mb-4">
                      <div className="w-[120px] shrink-0 text-gray-700">
                        <EditableText value={item.year} onChangeText={(v) => updEdu(item.id, "year", v)} />
                      </div>
                      <div className="flex-1">
                        <EditableText value={item.school} onChangeText={(v) => updEdu(item.id, "school", v)} className="font-bold text-gray-900 text-base" />
                        <div className="text-gray-800 mt-1 flex flex-col gap-1">
                          <EditableText value={item.degree} onChangeText={(v) => updEdu(item.id, "degree", v)} />
                          {item.major && <EditableText value={item.major} onChangeText={(v) => updEdu(item.id, "major", v)} className="text-gray-600 italic" />}
                          {item.gpa && <EditableText value={item.gpa} onChangeText={(v) => updEdu(item.id, "gpa", v)} className="text-gray-500 text-sm" />}
                          {item.description && <EditableText value={item.description} onChangeText={(v) => updEdu(item.id, "description", v)} className="text-gray-600 text-sm mt-1" />}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="mb-4">
                      <div className="items-start font-bold text-black text-base">
                        <EditableText value={item.school} onChangeText={(v) => updEdu(item.id, "school", v)} />
                        <EditableText value={item.year} onChangeText={(v) => updEdu(item.id, "year", v)} className="font-normal text-black text-sm shrink-0" />
                      </div>
                      <EditableText value={item.degree} onChangeText={(v) => updEdu(item.id, "degree", v)} className="font-bold text-black mb-1" />
                      {item.major && <EditableText value={item.major} onChangeText={(v) => updEdu(item.id, "major", v)} className="text-black text-sm italic mb-1" />}
                      {item.gpa && <EditableText value={item.gpa} onChangeText={(v) => updEdu(item.id, "gpa", v)} className="text-black text-sm italic" />}
                      {item.description && <EditableText value={item.description} onChangeText={(v) => updEdu(item.id, "description", v)} className="text-black text-sm mt-1" />}
                    </div>
                  );
                }
                // Template 3
                return (
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <EditableText value={item.degree} onChangeText={(v) => updEdu(item.id, "degree", v)} className={`font-semibold text-gray-800 ${fsClass}`} />
                      <EditableText value={item.year} onChangeText={(v) => updEdu(item.id, "year", v)} className="text-gray-400 text-xs shrink-0" />
                    </div>
                    <EditableText value={item.school} onChangeText={(v) => updEdu(item.id, "school", v)} className={`font-medium ${fsClass}`} style={{ color: theme.primary }} />
                    {item.major && <EditableText value={item.major} onChangeText={(v) => updEdu(item.id, "major", v)} className="text-gray-500 italic text-xs mt-0.5" />}
                    {item.gpa && (
                      <EditableText value={item.gpa} onChangeText={(v) => updEdu(item.id, "gpa", v)} className="text-gray-500 text-xs mt-1" />
                    )}
                    {item.description && (
                      <EditableText value={item.description} onChangeText={(v) => updEdu(item.id, "description", v)} className="text-gray-500 text-xs mt-1" />
                    )}
                  </div>
                );
              }}
            />
          </div>
        );

      case "skills":
        return (
          <div key="skills" className="mb-5">
            <SectionHeading title="Kỹ năng" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.skills}
              onAdd={() => set("skills", [...data.skills, { id: uid(), skill: "Kỹ năng mới", level: 3 }])}
              onRemove={(id) => set("skills", data.skills.filter((s) => s.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex items-center gap-2 mb-2 w-full">
                      <span className="text-gray-500">•</span>
                      <EditableText value={item.skill} onChangeText={(v) => updSkill(item.id, "skill", v)} className={`text-gray-800 ${fsClass} flex-1`} />
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="flex gap-4 mb-3 w-full items-start">
                      <div className="w-[200px] shrink-0 font-bold text-black">
                        <EditableText value={item.skill} onChangeText={(v) => updSkill(item.id, "skill", v)} />
                      </div>
                      <div className="flex-1 text-black">
                        <EditableText value="Mô tả kỹ năng..." onChangeText={(v) => console.log(v)} />
                      </div>
                    </div>
                  );
                }
                // Template 3
                return (
                  <div className="group flex items-center gap-2 w-full min-w-0 mb-1">
                    <EditableText value={item.skill} onChangeText={(v) => updSkill(item.id, "skill", v)} className={`text-gray-700 font-medium ${fsClass} flex-1 min-w-0`} />
                  </div>
                );
              }}
            />
          </div>
        );

      case "projects":
        return (
          <div key="projects" className="mb-5">
            <SectionHeading title="Dự án" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.projects}
              onAdd={() => set("projects", [...data.projects, { id: uid(), name: "Tên dự án", tech: "React, Node.js", description: "Mô tả dự án...", link: "github.com/..." }])}
              onRemove={(id) => set("projects", data.projects.filter((p) => p.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex gap-4 mb-4">
                      <div className="w-[120px] shrink-0 text-gray-700">
                        <EditableText value={item.tech} onChangeText={(v) => updProj(item.id, "tech", v)} className="italic" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-gray-900 mb-1 text-base">
                          <EditableText value={item.name} onChangeText={(v) => updProj(item.id, "name", v)} />
                          <span className="text-gray-400 font-normal">|</span>
                          <EditableText value={item.link} onChangeText={(v) => updProj(item.id, "link", v)} className="text-blue-500 font-normal underline" />
                        </div>
                        <EditableArea value={item.description} onChangeText={(v) => updProj(item.id, "description", v)} className={`text-gray-800 leading-relaxed ${fsClass}`} />
                      </div>
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="mb-4">
                      <div className="font-bold text-black text-base">
                        <EditableText value={item.name} onChangeText={(v) => updProj(item.id, "name", v)} />
                        <EditableText value={item.link} onChangeText={(v) => updProj(item.id, "link", v)} className="font-normal text-blue-600 text-sm shrink-0 underline" />
                      </div>
                      <EditableText value={item.tech} onChangeText={(v) => updProj(item.id, "tech", v)} className="font-medium text-gray-600 mb-1 italic" />
                      <EditableArea value={item.description} onChangeText={(v) => updProj(item.id, "description", v)} className={`text-black leading-relaxed whitespace-pre-wrap ${fsClass}`} />
                    </div>
                  );
                }
                // Template 3
                return (
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <EditableText value={item.name} onChangeText={(v) => updProj(item.id, "name", v)} className={`font-semibold text-gray-800 ${fsClass}`} />
                      <EditableText value={item.link} onChangeText={(v) => updProj(item.id, "link", v)} className="text-blue-500 text-xs underline shrink-0" />
                    </div>
                    <EditableText value={item.tech} onChangeText={(v) => updProj(item.id, "tech", v)} className="text-gray-500 italic text-xs mt-1" />
                    <EditableArea value={item.description} onChangeText={(v) => updProj(item.id, "description", v)} className={`text-gray-600 mt-1 leading-relaxed ${fsClass}`} />
                  </div>
                );
              }}
            />
          </div>
        );

      case "certificates":
        return (
          <div key="certificates" className="mb-5">
            <SectionHeading title="Chứng chỉ" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.certificates}
              onAdd={() => set("certificates", [...data.certificates, { id: uid(), name: "Tên chứng chỉ", issuer: "Tổ chức cấp", year: "2024" }])}
              onRemove={(id) => set("certificates", data.certificates.filter((c) => c.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex gap-4 mb-4">
                      <div className="w-[120px] shrink-0 text-gray-700">
                        <EditableText value={item.year} onChangeText={(v) => updCert(item.id, "year", v)} />
                      </div>
                      <div className="flex-1">
                        <EditableText value={item.name} onChangeText={(v) => updCert(item.id, "name", v)} className="font-bold text-gray-900 text-base" />
                        <EditableText value={item.issuer} onChangeText={(v) => updCert(item.id, "issuer", v)} className="text-gray-700 mt-1" />
                      </div>
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="mb-4">
                      <div className="font-bold text-black text-base">
                        <EditableText value={item.name} onChangeText={(v) => updCert(item.id, "name", v)} />
                        <EditableText value={item.year} onChangeText={(v) => updCert(item.id, "year", v)} className="font-normal text-black text-sm shrink-0" />
                      </div>
                      <EditableText value={item.issuer} onChangeText={(v) => updCert(item.id, "issuer", v)} className="text-gray-700 italic mb-1" />
                    </div>
                  );
                }
                // Template 3
                return (
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <EditableText value={item.name} onChangeText={(v) => updCert(item.id, "name", v)} className={`font-medium text-gray-700 ${fsClass}`} />
                      <EditableText value={item.year} onChangeText={(v) => updCert(item.id, "year", v)} className="text-gray-400 text-xs shrink-0" />
                    </div>
                    <EditableText value={item.issuer} onChangeText={(v) => updCert(item.id, "issuer", v)} className="text-gray-500 text-xs mt-1" />
                  </div>
                );
              }}
            />
          </div>
        );

      case "activities":
        return (
          <div key="activities" className="mb-5">
            <SectionHeading title="Hoạt động" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.activities}
              onAdd={() => set("activities", [...data.activities, { id: uid(), name: "Hoạt động", role: "Vai trò", duration: "2023" }])}
              onRemove={(id) => set("activities", data.activities.filter((a) => a.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex gap-4 mb-4">
                      <div className="w-[120px] shrink-0 text-gray-700">
                        <EditableText value={item.duration} onChangeText={(v) => updAct(item.id, "duration", v)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-gray-900 mb-1 text-base">
                          <EditableText value={item.name} onChangeText={(v) => updAct(item.id, "name", v)} />
                          <span className="text-gray-400 font-normal">|</span>
                          <EditableText value={item.role} onChangeText={(v) => updAct(item.id, "role", v)} className="text-gray-700" />
                        </div>
                      </div>
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="mb-4">
                      <div className="font-bold text-black text-base">
                        <EditableText value={item.name} onChangeText={(v) => updAct(item.id, "name", v)} />
                        <EditableText value={item.duration} onChangeText={(v) => updAct(item.id, "duration", v)} className="font-normal text-black text-sm shrink-0" />
                      </div>
                      <EditableText value={item.role} onChangeText={(v) => updAct(item.id, "role", v)} className="font-bold text-black mb-1" />
                    </div>
                  );
                }
                // Template 3
                return (
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <EditableText value={item.name} onChangeText={(v) => updAct(item.id, "name", v)} className={`font-semibold text-gray-800 ${fsClass}`} />
                      <EditableText value={item.duration} onChangeText={(v) => updAct(item.id, "duration", v)} className="text-gray-400 text-xs shrink-0" />
                    </div>
                    <EditableText value={item.role} onChangeText={(v) => updAct(item.id, "role", v)} className={`font-medium ${fsClass} mt-1`} style={{ color: theme.primary }} />
                  </div>
                );
              }}
            />
          </div>
        );

      case "awards":
        return (
          <div key="awards" className="mb-5">
            <SectionHeading title="Giải thưởng" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <DynamicListSection
              title=""
              items={data.awards}
              onAdd={() => set("awards", [...data.awards, { id: uid(), name: "Tên giải thưởng", org: "Tổ chức", year: "2024" }])}
              onRemove={(id) => set("awards", data.awards.filter((a) => a.id !== id))}
              renderItem={(item) => {
                if (templateId === 2) {
                  return (
                    <div className="flex gap-4 mb-4">
                      <div className="w-[120px] shrink-0 text-gray-700">
                        <EditableText value={item.year} onChangeText={(v) => updAward(item.id, "year", v)} />
                      </div>
                      <div className="flex-1">
                        <EditableText value={item.name} onChangeText={(v) => updAward(item.id, "name", v)} className="font-bold text-gray-900 text-base" />
                        <EditableText value={item.org} onChangeText={(v) => updAward(item.id, "org", v)} className="text-gray-700 mt-1" />
                      </div>
                    </div>
                  );
                }
                if (templateId === 1) {
                  return (
                    <div className="mb-4">
                      <div className="font-bold text-black text-base">
                        <EditableText value={item.name} onChangeText={(v) => updAward(item.id, "name", v)} />
                        <EditableText value={item.year} onChangeText={(v) => updAward(item.id, "year", v)} className="font-normal text-black text-sm shrink-0" />
                      </div>
                      <EditableText value={item.org} onChangeText={(v) => updAward(item.id, "org", v)} className="text-gray-700 italic mb-1" />
                    </div>
                  );
                }
                // Template 3
                return (
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <EditableText value={item.name} onChangeText={(v) => updAward(item.id, "name", v)} className={`font-medium text-gray-700 ${fsClass}`} />
                      <EditableText value={item.year} onChangeText={(v) => updAward(item.id, "year", v)} className="text-gray-400 text-xs shrink-0" />
                    </div>
                    <EditableText value={item.org} onChangeText={(v) => updAward(item.id, "org", v)} className="text-gray-500 text-xs mt-1" />
                  </div>
                );
              }}
            />
          </div>
        );

      case "hobbies":
        return (
          <div key="hobbies" className="mb-5">
            <SectionHeading title="Sở thích" templateId={templateId} color={theme.primary} oneCol={oneCol} />
            <EditableArea
              value={data.hobbies}
              onChangeText={(v) => set("hobbies", v)}
              className={`text-gray-800 leading-relaxed w-full ${fsClass}`}
              placeholder="Sở thích của bạn..."
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  /* ── Template 1 Layout ── */
  if (templateId === 1) {
    return (
      <div data-cv-document style={{ fontFamily, background: 'white' }} className={fsClass + " px-12 py-14 min-h-[1123px]"}>
        <div className="text-center mb-8">
          <EditableText
            value={data.fullName}
            onChangeText={(v) => set("fullName", v)}
            className="font-bold text-4xl text-center tracking-wide"
            style={{ color: theme.primary }}
          />
          <EditableText
            value={data.jobTitle}
            onChangeText={(v) => set("jobTitle", v)}
            className="font-bold text-lg text-center mt-2 text-gray-800"
          />
          <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-700">
            {data.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <EditableText value={data.phone} onChangeText={(v) => set("phone", v)} className="bg-transparent" />
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <EditableText value={data.email} onChangeText={(v) => set("email", v)} className="bg-transparent" />
              </div>
            )}
            {data.linkedin && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                <EditableText value={data.linkedin} onChangeText={(v) => set("linkedin", v)} className="bg-transparent" />
              </div>
            )}
            {data.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <EditableText value={data.address} onChangeText={(v) => set("address", v)} className="bg-transparent" />
              </div>
            )}
          </div>
        </div>
        <div>{enabledSections.map((k) => renderSection(k))}</div>
      </div>
    );
  }

  /* ── Template 2 Layout ── */
  if (templateId === 2) {
    return (
      <div data-cv-document style={{ fontFamily, background: 'white' }} className={fsClass + " px-12 py-14 min-h-[1123px]"}>
        <div className="flex gap-8 mb-8 items-center">
          <ImageUpload
            value={data.avatar}
            onChange={(v) => set("avatar", v)}
            className="w-40 h-40 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm"
          />
          <div className="flex-1">
            <EditableText
              value={data.fullName}
              onChangeText={(v) => set("fullName", v)}
              className="font-bold text-5xl tracking-tight"
              style={{ color: theme.primary }}
            />
            <div className="inline-block mt-2 mb-5 border-b-[2.5px] pb-1.5" style={{ borderColor: theme.primary }}>
              <EditableText
                value={data.jobTitle}
                onChangeText={(v) => set("jobTitle", v)}
                className="text-xl font-medium tracking-wide"
                style={{ color: theme.primary }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
              {data.dob && (
                <div className="flex items-center gap-3">
                  <span className="w-4 flex justify-center">📅</span>
                  <EditableText value={data.dob} onChangeText={(v) => set("dob", v)} className="bg-transparent" />
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  <EditableText value={data.phone} onChangeText={(v) => set("phone", v)} className="bg-transparent" />
                </div>
              )}
              {data.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <EditableText value={data.address} onChangeText={(v) => set("address", v)} className="bg-transparent" />
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  <EditableText value={data.email} onChangeText={(v) => set("email", v)} className="bg-transparent" />
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4" />
                  <EditableText value={data.linkedin} onChangeText={(v) => set("linkedin", v)} className="bg-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>{enabledSections.map((k) => renderSection(k))}</div>
      </div>
    );
  }

  /* ── Template 3: Two-column layout ── */
  if (!oneCol) {
    const leftSections: SectionKey[] = [
      "skills",
      "activities",
      "awards",
      "hobbies",
    ];
    const rightSections: SectionKey[] = [
      "summary",
      "certificates",
      "experience",
      "education",
      "projects",
    ];

    return (
      <div
        data-cv-document
        style={{
          fontFamily,
          background: `linear-gradient(to right, ${theme.sidebar} 220px, white 220px)`,
          minHeight: "1123px",
        }}
        className={fsClass}
      >
        <div className="flex min-h-full">
          <div className="w-[220px] shrink-0 px-4 py-5 flex flex-col gap-3">
            <ImageUpload
              value={data.avatar}
              onChange={(v) => set("avatar", v)}
              className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-sm object-cover"
            />
            <div className="text-center -mt-1">
              <EditableText
                value={data.fullName}
                onChangeText={(v) => set("fullName", v)}
                className="font-bold text-base text-center bg-transparent"
                style={{ color: theme.sidebarText }}
              />
              <EditableText
                value={data.jobTitle}
                onChangeText={(v) => set("jobTitle", v)}
                className="text-xs text-center bg-transparent mt-1"
                style={{ color: theme.primary }}
              />
            </div>

            <div className="mt-2">
              <h3
                className="text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-1"
                style={{ color: theme.primary, borderColor: theme.primary + "40" }}
              >
                Liên hệ
              </h3>
              {[
                { icon: Mail, val: data.email, key: "email" as const },
                { icon: Phone, val: data.phone, key: "phone" as const },
                { icon: MapPin, val: data.address, key: "address" as const },
                { icon: LinkIcon, val: data.linkedin, key: "linkedin" as const },
                { icon: Globe, val: data.website, key: "website" as const },
              ].map(({ icon: Icon, val, key }) => (
                <div key={key} className="flex items-start gap-1.5 mb-1.5">
                  <Icon className="w-3 h-3 mt-1 shrink-0" style={{ color: theme.primary }} />
                  <EditableText
                    value={val}
                    onChangeText={(v) => set(key, v)}
                    className="text-xs bg-transparent flex-1"
                    style={{ color: theme.sidebarText }}
                  />
                </div>
              ))}
              <div className="flex items-start gap-1.5 mb-1.5 mt-1.5">
                <span className="text-xs mt-1 shrink-0" style={{ color: theme.primary }}>🎂</span>
                <EditableText
                  value={data.dob}
                  onChangeText={(v) => set("dob", v)}
                  className="text-xs bg-transparent flex-1"
                  style={{ color: theme.sidebarText }}
                />
              </div>
            </div>

            <div className="mt-2">{leftSections.map((k) => renderSection(k))}</div>
          </div>

          <div className="flex-1 p-7 pt-8 bg-white min-h-[1123px]">
            {rightSections.map((k) => renderSection(k))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Template 3: One-column layout ── */
  return (
    <div 
      data-cv-document
      style={{ fontFamily, background: 'white' }} 
      className={fsClass + " min-h-[1123px]"}
    >
      <div className="p-8 pb-6" style={{ backgroundColor: theme.primary }}>
        <div className="flex items-center gap-6">
          <ImageUpload
            value={data.avatar}
            onChange={(v) => set("avatar", v)}
            className="w-28 h-28 rounded-full border-4 border-white/30 shrink-0 object-cover"
          />
          <div className="flex-1">
            <EditableText
              value={data.fullName}
              onChangeText={(v) => set("fullName", v)}
              className="text-white font-bold text-3xl bg-transparent"
            />
            <EditableText
              value={data.jobTitle}
              onChangeText={(v) => set("jobTitle", v)}
              className="text-white/90 text-base bg-transparent mt-1"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5">
          {[
            { icon: Mail, val: data.email, key: "email" as const },
            { icon: Phone, val: data.phone, key: "phone" as const },
            { icon: MapPin, val: data.address, key: "address" as const },
            { icon: LinkIcon, val: data.linkedin, key: "linkedin" as const },
          ].map(({ icon: Icon, val, key }) => (
            <div key={key} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-white/80 shrink-0" />
              <EditableText
                value={val}
                onChangeText={(v) => set(key, v)}
                className="text-white text-sm bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 pt-6">{enabledSections.map((k) => renderSection(k))}</div>
    </div>
  );
}
