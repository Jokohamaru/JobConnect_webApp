import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface JobReasonsProps {
  reasons: string[];
}

export default function JobReasons({ reasons }: JobReasonsProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm p-6 text-white">
      <h2 className="text-xl font-bold mb-1">Top reasons to join us</h2>
      <p className="text-blue-100 text-base mb-4">
        Why you&apos;ll love working here
      </p>
      <Separator className="bg-blue-500 mb-5" />

      <ul className="flex flex-col gap-3">
        {reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-blue-200 mt-0.5" />
            <span className="text-base text-blue-50 leading-relaxed">
              {reason}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
