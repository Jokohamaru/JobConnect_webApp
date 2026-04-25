import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  HeartPulse,
  Wallet,
  Layers,
  TrendingUp,
  Users,
  LucideIcon,
} from "lucide-react";
import type { Benefit } from "@/lib/types/company";

interface CompanyBenefitsProps {
  benefits: Benefit[];
}

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  HeartPulse,
  Wallet,
  Layers,
  TrendingUp,
  Users,
};

function BenefitCard({ benefit }: { benefit: Benefit }) {
  const Icon = iconMap[benefit.icon] ?? Trophy;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
        <Icon className="size-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{benefit.title}</h3>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          {benefit.description}
        </p>
      </div>
    </div>
  );
}

export default function CompanyBenefits({ benefits }: CompanyBenefitsProps) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Why you&apos;ll love working here
      </h2>
      <Separator className="mb-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {benefits.map((benefit) => (
          <BenefitCard key={benefit.id} benefit={benefit} />
        ))}
      </div>
    </section>
  );
}
