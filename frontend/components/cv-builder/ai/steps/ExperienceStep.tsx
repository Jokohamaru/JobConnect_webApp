"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Calendar,
  ChevronUp,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  Plus,
  Users,
  MessageSquare,
  LineChart,
  PenTool,
  Rocket,
  MoreHorizontal
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExperienceStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Main Experience Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Kinh nghiệm làm việc hiện tại hoặc gần nhất
            </h3>
            <button className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700">
              Ẩn gợi ý <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Tên công ty
              </label>
              <Input
                placeholder="Ví dụ: Công ty TNHH ABC"
                className="h-11 bg-gray-50/50 border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Vị trí công việc
              </label>
              <Input
                placeholder="Ví dụ: Nhân viên Marketing"
                className="h-11 bg-gray-50/50 border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Hình thức làm việc
              </label>
              <Select>
                <SelectTrigger className="h-11 px-3 w-full bg-gray-50/50 border-gray-200 text-gray-500 shadow-none font-normal">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">
                    Toàn thời gian (Full-time)
                  </SelectItem>
                  <SelectItem value="parttime">
                    Bán thời gian (Part-time)
                  </SelectItem>
                  <SelectItem value="freelance">Tự do (Freelance)</SelectItem>
                  <SelectItem value="intern">Thực tập (Internship)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Thời gian bắt đầu
              </label>
              <div className="relative">
                <Input
                  placeholder="MM/YYYY"
                  className="h-11 bg-gray-50/50 border-gray-200"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Thời gian kết thúc
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="MM/YYYY"
                    className="h-11 bg-gray-50/50 border-gray-200"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#1877F2] focus:ring-[#1877F2]"
                  />
                  Đang làm việc
                </label>
              </div>
            </div>
          </div>

          <div className="mb-5 space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Mô tả công việc
            </label>
            <Textarea
              placeholder="Mô tả ngắn gọn công việc và trách nhiệm chính của bạn..."
              className="min-h-[120px] bg-gray-50/50 border-gray-200 resize-none"
            />
            <div className="text-right text-xs text-gray-400">0/1000</div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Thành tựu nổi bật{" "}
              <span className="text-gray-400 font-normal">(nếu có)</span>
            </label>
            <Textarea
              placeholder="Nêu các kết quả, thành tựu hoặc đóng góp nổi bật của bạn..."
              className="min-h-[100px] bg-gray-50/50 border-gray-200 resize-none"
            />
            <div className="text-right text-xs text-gray-400">0/800</div>
          </div>

          <Button
            variant="outline"
            className="w-full border-dashed border-gray-300 text-[#1877F2] hover:bg-blue-50/50 hover:text-blue-700 h-12 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm kinh nghiệm khác
          </Button>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            Kỹ năng & thế mạnh liên quan{" "}
            <span className="text-gray-500 font-normal text-xs">
              (Chọn để AI hiểu bạn hơn)
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Làm việc nhóm", icon: Users },
              { name: "Quản lý dự án", icon: Briefcase },
              { name: "Giao tiếp khách hàng", icon: MessageSquare },
              { name: "Phân tích dữ liệu", icon: LineChart },
              { name: "Thiết kế", icon: PenTool },
              { name: "Bán hàng", icon: Rocket },
            ].map((skill) => {
              const Icon = skill.icon;
              return (
                <button
                  key={skill.name}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-[#1877F2] transition-colors flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5 text-[#1877F2]" /> {skill.name}
                </button>
              );
            })}
            <button className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <MoreHorizontal className="w-3.5 h-3.5 text-[#1877F2]" /> Khác
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: AI Suggestions & Timeline */}
      <div className="space-y-6">
        {/* AI Suggestions Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            Gợi ý từ AI <Sparkles className="w-4 h-4 text-[#1877F2]" />
          </h3>
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
            <div className="flex gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-[#1877F2] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Bạn có thể thêm kết quả hoặc thành tựu cụ thể để CV nổi bật hơn.
              </p>
            </div>
            <div className="space-y-2 mb-4">
              {[
                "Tăng doanh số 20%",
                "Quản lý 5 thành viên",
                "Thiết kế landing page cho chiến dịch",
              ].map((hint) => (
                <button
                  key={hint}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg text-xs font-medium text-[#1877F2] border border-blue-100 hover:bg-blue-50 transition-colors"
                >
                  + {hint}
                </button>
              ))}
            </div>
            <Button className="w-full bg-white hover:bg-gray-50 text-[#1877F2] border border-blue-100 shadow-sm h-10 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" /> Tối ưu mô tả
            </Button>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-5">
            Hành trình sự nghiệp
          </h3>
          <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
            {/* Timeline Item 1 */}
            <div className="relative flex items-start gap-4">
              <div className="absolute left-[-16px] w-3 h-3 bg-[#1877F2] rounded-full border-4 border-white box-content shadow-sm z-10" />
              <div className="bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10">
                <Briefcase className="w-4 h-4 text-[#1877F2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Công ty TNHH ABC
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Nhân viên Marketing
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  06/2022 - Hiện tại
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative flex items-start gap-4">
              <div className="absolute left-[-16px] w-3 h-3 bg-gray-300 rounded-full border-4 border-white box-content shadow-sm z-10" />
              <div className="bg-gray-50 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10">
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Công ty XYZ</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Thực tập sinh Marketing
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  03/2021 - 05/2022
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 italic">
            Hành trình của bạn sẽ được cập nhật tại đây
          </p>
        </div>

        {/* File Upload Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 leading-relaxed">
            Bạn có muốn tải CV cũ hoặc LinkedIn
            <br />
            để điền nhanh hơn?
          </h3>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer mb-4">
            <UploadCloud className="w-6 h-6 text-[#1877F2] mb-1" />
            <p className="text-xs font-semibold text-gray-800">
              Kéo & thả file vào đây
            </p>
            <p className="text-[10px] text-gray-500">
              Hỗ trợ: PDF, DOCX (tối đa 5MB)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="text-xs font-semibold text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Tải CV lên
            </Button>
            <Button
              variant="outline"
              className="text-xs font-semibold text-[#0A66C2] border-gray-200 hover:bg-blue-50"
            >
              <FaLinkedin className="w-4 h-4" /> Nhập từ LinkedIn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
