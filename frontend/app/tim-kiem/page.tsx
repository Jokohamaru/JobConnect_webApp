"use client";

import { Suspense } from "react";
import SearchResultsContent from "./SearchResultsContent";


export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center"><p>Đang tải...</p></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
