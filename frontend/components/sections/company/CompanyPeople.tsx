import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Camera } from "lucide-react";

interface CompanyPeopleProps {
  images: string[];
  companyName: string;
}

export default function CompanyPeople({
  images,
  companyName,
}: CompanyPeopleProps) {
  if (!images || images.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="size-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Life at {companyName}
        </h2>
      </div>
      <Separator className="mb-5" />

      {/* Responsive masonry-like grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl bg-gray-100 `}
            style={{ aspectRatio: i === 0 ? "1 / 1" : "4 / 3" }}
          >
            <Image
              src={src}
              alt={`${companyName} culture photo ${i + 1}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              unoptimized
            />
          </div>
        ))}
      </div>
    </section>
  );
}
