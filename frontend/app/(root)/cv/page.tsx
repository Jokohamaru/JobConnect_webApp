"use client";

import CVTemplateGrid from "@/components/sections/cv-page/CVTemplateGrid";
import FilterBar, { FilterOption } from "@/components/sections/cv-page/FilterBar";
import { CV_TEMPLATES } from "@/lib/cv-templates";
import { useState, useMemo } from "react";

export default function CVPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("Tất cả");

  const filtered = useMemo(() => {
    if (activeFilter === "Tất cả") return CV_TEMPLATES;
    return CV_TEMPLATES.filter((t) => t.tags.includes(activeFilter));
  }, [activeFilter]);

  return (
    <main className="min-h-screen bg-gray-50">


      {/* Filter & Content */}
      <section className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="px-6 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Chọn mẫu CV của bạn
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Tìm thấy{" "}
              <span className="font-semibold text-blue-600">
                {filtered.length}
              </span>{" "}
              mẫu phù hợp
            </p>
          </div>
          {/* Sort hint */}
          <span className="hidden sm:block text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            Được tối ưu cho ATS
          </span>
        </div>

        {/* Filters */}
        <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />

        {/* Grid */}
        <CVTemplateGrid templates={filtered} />
      </section>
    </main>
  );
}