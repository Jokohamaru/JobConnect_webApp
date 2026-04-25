import { DollarSign, HeartPulse, Laptop, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { JobDetailBenefits } from "@/lib/types/company";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function BenefitCard({ icon, title, description, color }: BenefitCardProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

interface JobBenefitsProps {
  detailBenefits: JobDetailBenefits;
}

export default function JobBenefits({ detailBenefits }: JobBenefitsProps) {
  const cards = [
    {
      icon: <DollarSign className="size-5 text-green-600" />,
      title: "Salary & Bonus",
      description: detailBenefits.salary,
      color: "bg-green-50",
    },
    {
      icon: <HeartPulse className="size-5 text-red-500" />,
      title: "Insurance & Healthcare",
      description: detailBenefits.insurance,
      color: "bg-red-50",
    },
    {
      icon: <Laptop className="size-5 text-blue-600" />,
      title: "Work Environment",
      description: detailBenefits.environment,
      color: "bg-blue-50",
    },
    {
      icon: <TrendingUp className="size-5 text-purple-600" />,
      title: "Career Growth",
      description: detailBenefits.growth,
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Benefits &amp; Perks
      </h2>
      <p className="text-gray-400 text-base mb-4">What we offer you</p>
      <Separator className="mb-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <BenefitCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
