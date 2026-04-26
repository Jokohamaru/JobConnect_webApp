"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CV_TEMPLATES } from "@/lib/cv-templates";

export default function CVBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const template = CV_TEMPLATES.find((t) => t.id === id);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {template ? `Bạn đã chọn: "${template.name}"` : "Mẫu CV"}
        </h1>
        <p className="text-gray-500 mb-8">
          Tính năng CV Builder đang được phát triển. Sẽ ra mắt sớm! 🚀
        </p>

        <button
          onClick={() => router.push("/cv")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách mẫu
        </button>
      </div>
    </main>
  );
}
