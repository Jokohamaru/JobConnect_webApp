import { CircleDot } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface JobRequirementsProps {
  requirements: string[];
}

export default function JobRequirements({ requirements }: JobRequirementsProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Requirements
      </h2>
      <p className="text-gray-400 text-base mb-4">
        Skills &amp; experience needed
      </p>
      <Separator className="mb-5" />

      <ul className="flex flex-col gap-3">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-start gap-3">
            <CircleDot className="size-4 shrink-0 text-blue-500 mt-0.5" />
            <span className="text-base text-gray-700 leading-relaxed">{req}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
