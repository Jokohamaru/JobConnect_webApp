"use client";

import { EditableText } from "@/components/cv/EditableText";
import { EditableArea } from "@/components/cv/EditableArea";
import { ImageUpload } from "@/components/cv/ImageUpload";
import { DynamicListSection } from "@/components/cv/DynamicListSection";
import { SectionKey } from "./SectionPanel";
import { COLOR_THEMES, LayoutType } from "./DesignPanel";
import { Mail, Phone, MapPin, LinkIcon, Globe } from "lucide-react";

/* ── Types ── */
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
  year: string;
  gpa?: string;
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
  colorIndex: number;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  layout: LayoutType;
  enabledSections: SectionKey[];
}

const uid = () => Math.random().toString(36).slice(2);
const fontSizeMap = { small: "text-xs", medium: "text-sm", large: "text-base" };

// Skill level bar
function SkillBar({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex gap-1 mt-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full"
          style={{ backgroundColor: i <= level ? color : "#e5e7eb" }}
        />
      ))}
    </div>
  );
}

// Section heading
function SectionHeading({
  title,
  color,
  oneCol,
}: {
  title: string;
  color: string;
  oneCol: boolean;
}) {
  if (oneCol) {
    return (
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }
  return (
    <h3
      className="font-bold uppercase tracking-wide text-sm mb-3 pb-1 border-b-2"
      style={{ borderColor: color, color }}
    >
      {title}
    </h3>
  );
}

export function CVDocument({
  data,
  onChange,
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

  // Per-section typed updaters
  const updExp = (id: string, f: keyof ExperienceItem, v: string) =>
    set(
      "experiences",
      data.experiences.map((e) => (e.id === id ? { ...e, [f]: v } : e)),
    );
  const updEdu = (id: string, f: keyof EducationItem, v: string) =>
    set(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, [f]: v } : e)),
    );
  const updSkill = (id: string, f: keyof SkillItem, v: string | number) =>
    set(
      "skills",
      data.skills.map((s) => (s.id === id ? { ...s, [f]: v } : s)),
    );
  const updProj = (id: string, f: keyof ProjectItem, v: string) =>
    set(
      "projects",
      data.projects.map((p) => (p.id === id ? { ...p, [f]: v } : p)),
    );
  const updCert = (id: string, f: keyof CertItem, v: string) =>
    set(
      "certificates",
      data.certificates.map((c) => (c.id === id ? { ...c, [f]: v } : c)),
    );
  const updAct = (id: string, f: keyof ActivityItem, v: string) =>
    set(
      "activities",
      data.activities.map((a) => (a.id === id ? { ...a, [f]: v } : a)),
    );
  const updAward = (id: string, f: keyof AwardItem, v: string) =>
    set(
      "awards",
      data.awards.map((a) => (a.id === id ? { ...a, [f]: v } : a)),
    );

  /* ── Render sections ── */
  const renderSection = (key: SectionKey) => {
    if (!enabledSections.includes(key)) return null;

    switch (key) {
      case "summary":
        return (
          <div key="summary" className="mb-5">
            <SectionHeading
              title="Mục tiêu nghề nghiệp"
              color={theme.primary}
              oneCol={oneCol}
            />
            <EditableArea
              value={data.summary}
              onChangeText={(v) => set("summary", v)}
              className={`text-gray-600 leading-relaxed w-full ${fsClass}`}
              placeholder="Mô tả mục tiêu nghề nghiệp của bạn..."
            />
          </div>
        );

      case "experience":
        return (
          <div key="experience" className="mb-5">
            <SectionHeading
              title="Kinh nghiệm làm việc"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.experiences}
              onAdd={() =>
                set("experiences", [
                  ...data.experiences,
                  {
                    id: uid(),
                    position: "Vị trí công việc",
                    company: "Tên công ty",
                    duration: "01/2024 – Hiện tại",
                    description: "Mô tả công việc...",
                  },
                ])
              }
              onRemove={(id) =>
                set(
                  "experiences",
                  data.experiences.filter((e) => e.id !== id),
                )
              }
              renderItem={(item) => (
                <div>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <EditableText
                      value={item.position}
                      onChangeText={(v) => updExp(item.id, "position", v)}
                      className={`font-semibold text-gray-800 ${fsClass}`}
                    />
                    <EditableText
                      value={item.duration}
                      onChangeText={(v) => updExp(item.id, "duration", v)}
                      className={`text-gray-400 text-xs shrink-0`}
                    />
                  </div>
                  <EditableText
                    value={item.company}
                    onChangeText={(v) => updExp(item.id, "company", v)}
                    className={`font-medium ${fsClass}`}
                    style={{ color: theme.primary }}
                  />
                  <EditableArea
                    value={item.description}
                    onChangeText={(v) => updExp(item.id, "description", v)}
                    className={`text-gray-600 mt-1 leading-relaxed ${fsClass}`}
                  />
                </div>
              )}
            />
          </div>
        );

      case "education":
        return (
          <div key="education" className="mb-5">
            <SectionHeading
              title="Học vấn"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.education}
              onAdd={() =>
                set("education", [
                  ...data.education,
                  {
                    id: uid(),
                    degree: "Tên bằng cấp",
                    school: "Trường Đại học",
                    year: "2020 – 2024",
                    gpa: "3.5/4.0",
                  },
                ])
              }
              onRemove={(id) =>
                set(
                  "education",
                  data.education.filter((e) => e.id !== id),
                )
              }
              renderItem={(item) => (
                <div>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <EditableText
                      value={item.degree}
                      onChangeText={(v) => updEdu(item.id, "degree", v)}
                      className={`font-semibold text-gray-800 ${fsClass}`}
                    />
                    <EditableText
                      value={item.year}
                      onChangeText={(v) => updEdu(item.id, "year", v)}
                      className="text-gray-400 text-xs shrink-0"
                    />
                  </div>
                  <EditableText
                    value={item.school}
                    onChangeText={(v) => updEdu(item.id, "school", v)}
                    className={`font-medium ${fsClass}`}
                    style={{ color: theme.primary }}
                  />
                  {item.gpa && (
                    <EditableText
                      value={item.gpa}
                      onChangeText={(v) => updEdu(item.id, "gpa", v)}
                      className="text-gray-500 text-xs"
                    />
                  )}
                </div>
              )}
            />
          </div>
        );

      case "skills":
        return (
          <div key="skills" className="mb-5">
            <SectionHeading
              title="Kỹ năng"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.skills}
              onAdd={() =>
                set("skills", [
                  ...data.skills,
                  { id: uid(), skill: "Kỹ năng mới", level: 3 },
                ])
              }
              onRemove={(id) =>
                set(
                  "skills",
                  data.skills.filter((s) => s.id !== id),
                )
              }
              renderItem={(item) => (
                <div className="group flex items-center gap-2 w-full min-w-0">
                  <EditableText
                    value={item.skill}
                    onChangeText={(v) => updSkill(item.id, "skill", v)}
                    className={`text-gray-700 font-medium ${fsClass} flex-1 min-w-0 w-full`}
                  />
                </div>
              )}
            />
          </div>
        );
      case "projects":
        return (
          <div key="projects" className="mb-5">
            <SectionHeading
              title="Dự án"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.projects}
              onAdd={() =>
                set("projects", [
                  ...data.projects,
                  {
                    id: uid(),
                    name: "Tên dự án",
                    tech: "React, Node.js",
                    description: "Mô tả dự án...",
                    link: "github.com/...",
                  },
                ])
              }
              onRemove={(id) =>
                set(
                  "projects",
                  data.projects.filter((p) => p.id !== id),
                )
              }
              renderItem={(item) => (
                <div>
                  <div className="">
                    <EditableText
                      value={item.name}
                      onChangeText={(v) => updProj(item.id, "name", v)}
                      className={`font-semibold text-gray-800 ${fsClass}`}
                    />
                    <EditableText
                      value={item.link}
                      onChangeText={(v) => updProj(item.id, "link", v)}
                      className="text-blue-500 text-xs underline shrink-0"
                    />
                  </div>
                  <EditableText
                    value={item.tech}
                    onChangeText={(v) => updProj(item.id, "tech", v)}
                    className="text-gray-500 italic text-xs"
                  />
                  <EditableArea
                    value={item.description}
                    onChangeText={(v) => updProj(item.id, "description", v)}
                    className={`text-gray-600 mt-1 leading-relaxed ${fsClass}`}
                  />
                </div>
              )}
            />
          </div>
        );

      case "certificates":
        return (
          <div key="certificates" className="mb-5">
            <SectionHeading
              title="Chứng chỉ"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.certificates}
              onAdd={() =>
                set("certificates", [
                  ...data.certificates,
                  {
                    id: uid(),
                    name: "Tên chứng chỉ",
                    issuer: "Tổ chức cấp",
                    year: "2024",
                  },
                ])
              }
              onRemove={(id) =>
                set(
                  "certificates",
                  data.certificates.filter((c) => c.id !== id),
                )
              }
              renderItem={(item) => (
                <div className="">
                  <div
                    className=""
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div className="flex-1">
                    <div className="gap-2">
                      <EditableText
                        value={item.name}
                        onChangeText={(v) => updCert(item.id, "name", v)}
                        className={`font-medium text-gray-700 ${fsClass}`}
                      />
                      <EditableText
                        value={item.year}
                        onChangeText={(v) => updCert(item.id, "year", v)}
                        className="text-gray-400 text-xs shrink-0"
                      />
                    </div>
                    <EditableText
                      value={item.issuer}
                      onChangeText={(v) => updCert(item.id, "issuer", v)}
                      className="text-gray-500 text-xs"
                    />
                  </div>
                </div>
              )}
            />
          </div>
        );

      case "activities":
        return (
          <div key="activities" className="mb-5">
            <SectionHeading
              title="Hoạt động ngoại khoá"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.activities}
              onAdd={() =>
                set("activities", [
                  ...data.activities,
                  {
                    id: uid(),
                    name: "Tên hoạt động",
                    role: "Vai trò",
                    duration: "2023",
                  },
                ])
              }
              onRemove={(id) =>
                set(
                  "activities",
                  data.activities.filter((a) => a.id !== id),
                )
              }
              renderItem={(item) => (
                <div>
                  <div className="">
                    <EditableText
                      value={item.name}
                      onChangeText={(v) => updAct(item.id, "name", v)}
                      className={`font-semibold text-gray-800 ${fsClass}`}
                    />
                    <EditableText
                      value={item.duration}
                      onChangeText={(v) => updAct(item.id, "duration", v)}
                      className="text-gray-400 text-xs shrink-0"
                    />
                  </div>
                  <EditableText
                    value={item.role}
                    onChangeText={(v) => updAct(item.id, "role", v)}
                    className={`font-medium ${fsClass}`}
                    style={{ color: theme.primary }}
                  />
                </div>
              )}
            />
          </div>
        );

      case "awards":
        return (
          <div key="awards" className="mb-5">
            <SectionHeading
              title="Giải thưởng"
              color={theme.primary}
              oneCol={oneCol}
            />
            <DynamicListSection
              title=""
              items={data.awards}
              onAdd={() =>
                set("awards", [
                  ...data.awards,
                  {
                    id: uid(),
                    name: "Tên giải thưởng",
                    org: "Tổ chức",
                    year: "2024",
                  },
                ])
              }
              onRemove={(id) =>
                set(
                  "awards",
                  data.awards.filter((a) => a.id !== id),
                )
              }
              renderItem={(item) => (
                <div className="">
                  <div>
                    <EditableText
                      value={item.name}
                      onChangeText={(v) => updAward(item.id, "name", v)}
                      className={`font-medium text-gray-700 ${fsClass}`}
                    />
                    <EditableText
                      value={item.org}
                      onChangeText={(v) => updAward(item.id, "org", v)}
                      className="text-gray-500 text-xs"
                    />
                  </div>
                  <EditableText
                    value={item.year}
                    onChangeText={(v) => updAward(item.id, "year", v)}
                    className="text-gray-400 text-xs shrink-0"
                  />
                </div>
              )}
            />
          </div>
        );

      case "hobbies":
        return (
          <div key="hobbies" className="mb-5">
            <SectionHeading
              title="Sở thích"
              color={theme.primary}
              oneCol={oneCol}
            />
            <EditableArea
              value={data.hobbies}
              onChangeText={(v) => set("hobbies", v)}
              className={`text-gray-600 leading-relaxed w-full ${fsClass}`}
              placeholder="Đọc sách, Thể thao, Du lịch..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Two-column layout ── */
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
          // Gradient trick: sidebar màu nền 220px đầu, còn lại trắng
          background: `linear-gradient(to right, ${theme.sidebar} 220px, white 220px)`,
          minHeight: "100%",
        }}
        className={fsClass}
      >
        <div className="flex">
          {/* Sidebar — nền trong suốt, background từ parent gradient */}
          <div className="w-[220px] shrink-0 px-4 py-5 flex flex-col gap-3">
            <ImageUpload
              value={data.avatar}
              onChange={(v) => set("avatar", v)}
              className="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-sm"
            />
            <div className="text-center -mt-1">
              <EditableText
                value={data.fullName}
                onChangeText={(v) => set("fullName", v)}
                className="font-bold text-base text-center bg-transparent border-transparent hover:border-black/20 focus:border-black/40 focus:bg-white/60"
                style={{ color: theme.sidebarText }}
              />
              <EditableText
                value={data.jobTitle}
                onChangeText={(v) => set("jobTitle", v)}
                className="text-xs text-center bg-transparent border-transparent hover:border-black/20 focus:border-black/40 focus:bg-white/60"
                style={{ color: theme.primary }}
              />
            </div>

            {/* Contact */}
            <div>
              <h3
                className="text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-1"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary + "40",
                }}
              >
                Liên hệ
              </h3>
              {[
                { icon: Mail, val: data.email, key: "email" as const },
                { icon: Phone, val: data.phone, key: "phone" as const },
                { icon: MapPin, val: data.address, key: "address" as const },
                {
                  icon: LinkIcon,
                  val: data.linkedin,
                  key: "linkedin" as const,
                },
                { icon: Globe, val: data.website, key: "website" as const },
              ].map(({ icon: Icon, val, key }) => (
                <div key={key} className="flex items-start gap-1.5 mb-1.5">
                  <Icon
                    className="w-3 h-3 mt-1 shrink-0"
                    style={{ color: theme.primary }}
                  />
                  <EditableText
                    value={val}
                    onChangeText={(v) => set(key, v)}
                    className="text-xs bg-transparent border-transparent hover:border-black/20 focus:border-black/40 focus:bg-white/60 flex-1"
                    style={{ color: theme.sidebarText }}
                  />
                </div>
              ))}
              {/* DOB */}
              <div className="flex items-start gap-1.5 mb-1.5">
                <span
                  className="text-xs mt-1 shrink-0"
                  style={{ color: theme.primary }}
                >
                  🎂
                </span>
                <EditableText
                  value={data.dob}
                  onChangeText={(v) => set("dob", v)}
                  className="text-xs bg-transparent border-transparent hover:border-black/20 focus:border-black/40 focus:bg-white/60 flex-1"
                  style={{ color: theme.sidebarText }}
                />
              </div>
            </div>

            {/* Left sections */}
            {leftSections.map((k) => renderSection(k))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-7 pt-8">
            {rightSections.map((k) => renderSection(k))}
          </div>
        </div>
      </div>
    );
  }

  /* ── One-column layout ── */
  return (
    <div 
      data-cv-document
      style={{
        fontFamily,
        background: 'white',
      }} 
      className={fsClass + "my-5"}
    >
      {/* Header bar */}
      <div className="p-6 pb-4 " style={{ backgroundColor: theme.primary }}>
        <div className="flex items-center gap-5">
          <ImageUpload
            value={data.avatar}
            onChange={(v) => set("avatar", v)}
            className="w-24 h-24 rounded-full border-4 border-white/30 shrink-0"
          />
          <div className="flex-1">
            <EditableText
              value={data.fullName}
              onChangeText={(v) => set("fullName", v)}
              className="text-white font-bold text-2xl bg-transparent border-transparent hover:border-white/40 focus:border-white focus:bg-white/10"
            />
            <EditableText
              value={data.jobTitle}
              onChangeText={(v) => set("jobTitle", v)}
              className="text-white/80 text-sm bg-transparent border-transparent hover:border-white/40 focus:border-white focus:bg-white/10"
            />
          </div>
        </div>
        {/* Contact row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
          {[
            { icon: Mail, val: data.email, key: "email" as const },
            { icon: Phone, val: data.phone, key: "phone" as const },
            { icon: MapPin, val: data.address, key: "address" as const },
            { icon: LinkIcon, val: data.linkedin, key: "linkedin" as const },
          ].map(({ icon: Icon, val, key }) => (
            <div key={key} className="flex items-center gap-1">
              <Icon className="w-3 h-3 text-white/70 shrink-0" />
              <EditableText
                value={val}
                onChangeText={(v) => set(key, v)}
                className="text-white text-xs bg-transparent border-transparent hover:border-white/40 focus:border-white focus:bg-white/10"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="p-7">{enabledSections.map((k) => renderSection(k))}</div>
    </div>
  );
}
