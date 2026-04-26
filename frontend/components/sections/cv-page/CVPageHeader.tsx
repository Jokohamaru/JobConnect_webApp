"use client";

import { FileText, Sparkles, TrendingUp } from "lucide-react";

export default function CVPageHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/20 mb-5">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Mẫu CV được thiết kế bởi chuyên gia
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Danh Sách Mẫu CV{" "}
          <span className="text-yellow-300">Xin Việc</span>
        </h1>

        {/* Subtitle */}
        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Chọn mẫu CV phù hợp với phong cách của bạn. Tất cả mẫu đều
          tương thích ATS, dễ đọc và được nhà tuyển dụng ưa thích.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { icon: FileText, label: "Mẫu CV", value: "20+" },
            { icon: TrendingUp, label: "Lượt dùng", value: "500K+" },
            { icon: Sparkles, label: "Tỷ lệ thành công", value: "94%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-blue-200">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
