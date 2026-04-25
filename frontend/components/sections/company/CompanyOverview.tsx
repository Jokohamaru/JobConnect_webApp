import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CompanyOverviewProps {
  paragraphs: string[];
  bullets: string[];
}

export default function CompanyOverview({
  paragraphs,
  bullets,
}: CompanyOverviewProps) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Company Overview
      </h2>
      <Separator className="mb-5" />

      {/* Paragraphs */}
      <div className="flex flex-col gap-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-base text-gray-600 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Bullet highlights */}
      {bullets.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2.5">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <span className="text-sm text-gray-700">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
