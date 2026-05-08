"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Minus, Plus, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface BasicInfoSectionProps {
  data: {
    title: string;
    department: string;
    level: string;
    workType: string;
    location: string;
    salaryMin: string;
    salaryMax: string;
    headcount: number;
    deadline: string;
  };
  onChange: (field: string, value: string | number) => void;
}

export function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/cities`);
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <div className="space-y-5">
      {/* Row 1: Tên công việc + Phòng ban */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="job-title" className="text-sm font-medium text-gray-700">
            Tên công việc <span className="text-red-500">*</span>
          </Label>
          <Input
            id="job-title"
            placeholder="VD: Frontend Developer (ReactJS)"
            value={data.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="h-10 border-gray-200 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Phòng ban <span className="text-red-500">*</span>
          </Label>
          <Select value={data.department} onValueChange={(v) => onChange("department", v)}>
            <SelectTrigger className="h-10 w-full border-gray-200">
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              {["Công nghệ thông tin", "Marketing", "Kinh doanh", "Nhân sự", "Kế toán", "Vận hành"].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Cấp bậc + Hình thức làm việc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Cấp bậc <span className="text-red-500">*</span>
          </Label>
          <Select value={data.level} onValueChange={(v) => onChange("level", v)}>
            <SelectTrigger className="h-10 w-full border-gray-200">
              <SelectValue placeholder="Chọn cấp bậc" />
            </SelectTrigger>
            <SelectContent>
              {["Thực tập sinh", "Nhân viên", "Chuyên viên", "Trưởng nhóm", "Quản lý", "Giám đốc"].map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Hình thức làm việc <span className="text-red-500">*</span>
          </Label>
          <Select value={data.workType} onValueChange={(v) => onChange("workType", v)}>
            <SelectTrigger className="h-10 w-full border-gray-200">
              <SelectValue placeholder="Chọn hình thức" />
            </SelectTrigger>
            <SelectContent>
              {["Toàn thời gian", "Bán thời gian", "Remote", "Hybrid", "Hợp đồng"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Địa điểm + Mức lương */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Địa điểm làm việc <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={data.location} 
            onValueChange={(v) => onChange("location", v)}
            disabled={loadingCities}
          >
            <SelectTrigger className="h-10 w-full border-gray-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder={loadingCities ? "Đang tải..." : "Chọn địa điểm"} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Mức lương <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5 bg-white h-10 shrink-0">
              <span className="text-sm font-medium text-gray-600">VND</span>
            </div>
            <Input
              placeholder="20,000,000"
              value={data.salaryMin}
              onChange={(e) => onChange("salaryMin", e.target.value)}
              className="h-10 border-gray-200 focus-visible:ring-blue-500"
            />
            <span className="text-gray-400 shrink-0">–</span>
            <Input
              placeholder="30,000,000"
              value={data.salaryMax}
              onChange={(e) => onChange("salaryMax", e.target.value)}
              className="h-10 border-gray-200 focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Row 4: Số lượng tuyển + Hạn nộp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Số lượng tuyển <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2 h-10 border border-gray-200 rounded-lg w-fit px-3 bg-white">
            <Button
              onClick={() => onChange("headcount", Math.max(1, data.headcount - 1))}
              className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="h-3.5 w-3.5 text-gray-600" />
            </Button>
            <span className="w-8 text-center font-semibold text-gray-800">{data.headcount}</span>
            <Button
              onClick={() => onChange("headcount", data.headcount + 1)}
              className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-gray-600" />
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Hạn nộp hồ sơ <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full flex items-center justify-between border-gray-200 rounded-lg px-3 h-10 text-sm bg-white hover:border-blue-400 font-normal",
                  !data.deadline && "text-gray-400"
                )}
              >
                {data.deadline
                  ? format(new Date(data.deadline), "dd/MM/yyyy")
                  : "Chọn ngày hạn nộp"}
                <CalendarIcon className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.deadline ? new Date(data.deadline) : undefined}
                onSelect={(d) =>
                  onChange("deadline", d ? d.toISOString().split("T")[0] : "")
                }
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
