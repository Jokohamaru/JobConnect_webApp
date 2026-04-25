import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code2 } from "lucide-react";

interface CompanySkillsProps {
  skills: string[];
}

export default function CompanySkills({ skills }: CompanySkillsProps) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="size-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Technologies</h2>
      </div>
      <Separator className="mb-5" />

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant="outline"
            className="
              h-auto rounded-lg border-gray-200 bg-gray-50
              px-3 py-1.5 text-sm font-medium text-gray-700
              hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
              transition-colors cursor-default
            "
          >
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  );
}
