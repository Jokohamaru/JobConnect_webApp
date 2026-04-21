import AwardForm from "./forms/AwardForm";
import CertForm from "./forms/CertForm";
import EduForm from "./forms/EduForm";
import ExpForm from "./forms/ExpForm";
import IntroForm from "./forms/IntroForm";
import LangForm from "./forms/LangForm";
import ProjForm from "./forms/ProJForm";
import SkillForm from "./forms/SkillForm";
import { SectionKey } from "./sections/types";

export interface CVData {
  intro: { title: string };
  edu: { school: string };
  exp: { company: string; position: string };
  skill: { skills: string[] };
  lang: { language: string };
  proj: { name: string };
  cert: { name: string };
  award: { name: string };
}
export const FORM_MAP: Record<SectionKey, React.ReactNode> = {
  intro: <IntroForm />,
  edu: <EduForm />,
  exp: <ExpForm />,
  skill: <SkillForm />,
  lang: <LangForm />,
  proj: <ProjForm />,
  cert: <CertForm />,
  award: <AwardForm />,
};