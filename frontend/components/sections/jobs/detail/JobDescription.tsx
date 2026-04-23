import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface JobDescriptionProps {
  description: string[];
  descriptionBullets: string[];
}

export default function JobDescription({
  description,
  descriptionBullets,
}: JobDescriptionProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Job Description</h2>
      <p className="text-gray-400 text-base mb-4">What you&apos;ll be doing</p>
      <Separator className="mb-5" />

      {/* Paragraphs */}
      <div className="flex flex-col gap-3 mb-5">
        {description.map((para, i) => (
          <p key={i} className="text-base text-gray-600 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Bullet points */}
      {descriptionBullets.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {descriptionBullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <ChevronRight className="size-4 shrink-0 text-blue-500 mt-0.5" />
              <span className="text-sm text-gray-700 leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
