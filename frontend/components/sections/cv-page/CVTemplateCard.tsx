"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CVTemplate {
  id: number;
  name: string;
  image: string;
  tags: string[];
  isNew: boolean;
  downloads?: number;
}

interface CVTemplateCardProps {
  template: CVTemplate;
}

const TAG_COLORS: Record<string, string> = {
  ATS: "bg-blue-50 text-blue-600 border border-blue-200",
  "Đơn giản": "bg-gray-100 text-gray-600 border border-gray-200",
  "Chuyên nghiệp": "bg-purple-50 text-purple-600 border border-purple-200",
  "Hiện đại": "bg-cyan-50 text-cyan-600 border border-cyan-200",
  "Liên đại": "bg-orange-50 text-orange-600 border border-orange-200",
};

export default function CVTemplateCard({ template }: CVTemplateCardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden",
        "border border-gray-100 shadow-sm",
        "hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1.5",
        "transition-all duration-300 cursor-pointer",
      )}
    >
      {/* Badge "Mới" */}
      {template.isNew && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            ✦ Mới
          </span>
        </div>
      )}

      {/* CV Image — A4 ratio ≈ 1:1.414 */}
      <div className="relative w-full aspect-[1/1.414] overflow-hidden bg-gray-50">
        <Image
          src={template.image}
          alt={`Mẫu CV ${template.name}`}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom overlay text */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => router.push(`/cv-builder/${template.id}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors duration-200 shadow-lg"
          >
            Dùng mẫu này
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-base leading-tight line-clamp-2 flex-1 mr-2">
            {template.name}
          </h3>
          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "text-xs font-medium px-2.5 py-0.5 rounded-full",
                TAG_COLORS[tag] ??
                  "bg-gray-100 text-gray-500 border border-gray-200",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
