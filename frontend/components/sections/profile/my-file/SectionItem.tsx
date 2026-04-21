import { Plus } from "lucide-react";
import { Section } from "./sections/types";


interface Props {
  section: Section;
  onClick: () => void;
}

export default function SectionItem({ section, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition text-left group bg-white rounded-2xl"
    >
      <div className="flex items-center  gap-2">
        
        <div>
          <p className="text-xl font-bold mb-2">{section.title}</p>
          <p className="text-xs text-muted-foreground text-gray-400">{section.desc}</p>
        </div>
      </div>

      <div className="w-6 h-6 border border-blue-400 text-blue-500 flex items-center justify-center rounded-full group-hover:bg-blue-500 group-hover:text-white transition">
        <Plus className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}