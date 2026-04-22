import AwardForm from "./forms/AwardForm";
import CertForm from "./forms/CertForm";
import EduForm from "./forms/EduForm";
import ExpForm from "./forms/ExpForm";
import IntroForm from "./forms/IntroForm";
import LangForm from "./forms/LangForm";
import ProjForm from "./forms/ProJForm";
import SkillForm from "./forms/SkillForm";
import { SectionKey } from "./sections/types";

type FormProps = {
  data: any;
  setData: (val: any) => void;
};

export const FORM_MAP: Record<
  SectionKey,
  (props: FormProps) => React.ReactNode
> = {
  intro: (props) => <IntroForm {...props} />,
  edu: (props) => <EduForm {...props} />,
  exp: (props) => <ExpForm {...props} />,
  skill: (props) => <SkillForm {...props} />,
  lang: (props) => <LangForm {...props} />,
  proj: (props) => <ProjForm {...props} />,
  cert: (props) => <CertForm {...props} />,
  award: (props) => <AwardForm {...props} />,
};
