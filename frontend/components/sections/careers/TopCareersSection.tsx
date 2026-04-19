"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import CareerCard from "./CareerCard";
import { Button } from "@/components/ui/button";

interface Career {
  id: number;
  icon: string;
  title: string;
  jobCount: number;
}

// 👉 chia mảng thành page
function chunkArray(arr: Career[], size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function TopCareersSection() {
  const itemsPerPage = 8;

  const careers: Career[] = Array.from({ length: 16 }).map((_, i) => ({
    id: i + 1,
    icon: "",
    title: `Ngành nghề ${i + 1}`,
    jobCount: i * 100 + 50,
  }));

  const pages = chunkArray(careers, itemsPerPage);

  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-12  ">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-3xl font-bold text-blue-600">
            Top ngành nghề nổi bật
          </h2>
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>

        {/* 🚀 SLIDER */}
        <div className="overflow-hidden mb-8">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{
              transform: `translateX(-${currentPage * 100}%)`,
            }}
          >
            {pages.map((page, index) => (
              <div
                key={index}
                className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
              >
                {page.map((career) => (
                  <CareerCard key={career.id} {...career} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* 👉 số trang */}
          <span className="text-sm font-medium">
            {currentPage + 1} / {pages.length}
          </span>

          <Button
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}