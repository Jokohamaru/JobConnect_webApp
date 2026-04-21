import { User, GraduationCap, Briefcase, Zap, Globe, LayoutGrid, Award, Medal } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SectionKey =
  | "intro"
  | "edu"
  | "exp"
  | "skill"
  | "lang"
  | "proj"
  | "cert"
  | "award";

export interface Section {
  key: SectionKey;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// ─── Section List ─────────────────────────────────────────────────────────────

export const SECTIONS: Section[] = [
  {
    key: "intro",
    title: "Giới thiệu bản thân",
    desc: "Giới thiệu điểm mạnh và số năm kinh nghiệm của bạn",
    icon: <User className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "edu",
    title: "Học vấn",
    desc: "Chia sẻ trình độ học vấn của bạn",
    icon: <GraduationCap className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "exp",
    title: "Kinh nghiệm làm việc",
    desc: "Thể hiện những thông tin chi tiết về quá trình làm việc",
    icon: <Briefcase className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "skill",
    title: "Kỹ năng",
    desc: "Liệt kê các kỹ năng chuyên môn của bạn",
    icon: <Zap className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "lang",
    title: "Ngoại ngữ",
    desc: "Liệt kê các ngôn ngữ mà bạn biết",
    icon: <Globe className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "proj",
    title: "Dự án nổi bật",
    desc: "Giới thiệu dự án nổi bật của bạn",
    icon: <LayoutGrid className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "cert",
    title: "Chứng chỉ",
    desc: "Bổ sung chứng chỉ liên quan đến kỹ năng của bạn",
    icon: <Award className="w-4 h-4 text-blue-500" />,
  },
  {
    key: "award",
    title: "Giải thưởng",
    desc: "Thể hiện giải thưởng hoặc thành tích mà bạn đạt được",
    icon: <Medal className="w-4 h-4 text-blue-500" />,
  },
];
