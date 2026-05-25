"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Briefcase } from "lucide-react";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface JobFormData {
  recruiterId: string;
  title: string;
  description: string;
  headcount: string;
  minSalary: string;
  maxSalary: string;
  currency: string;
  cityId: string;
}

interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: {
    id: string;
    name: string;
  } | null;
}

interface City {
  id: string;
  name: string;
}

export function AddJobModal({ open, onClose, onSuccess }: AddJobModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    recruiterId: "",
    title: "",
    description: "",
    headcount: "1",
    minSalary: "",
    maxSalary: "",
    currency: "VND",
    cityId: "",
  });
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch recruiters and cities
  useEffect(() => {
    if (open) {
      fetchRecruiters();
      fetchCities();
    }
  }, [open]);

  const fetchRecruiters = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const response = await fetch(`${apiUrl}/admin/recruiters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecruiters(data);
        // Set default recruiter if available
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, recruiterId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const response = await fetch(`${apiUrl}/cities`);

      if (response.ok) {
        const data = await response.json();
        setCities(data);
        // Set default city if available
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, cityId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recruiterId) {
      setError("Vui lòng chọn nhà tuyển dụng");
      return;
    }

    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề công việc");
      return;
    }

    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả công việc");
      return;
    }

    if (!formData.cityId) {
      setError("Vui lòng chọn địa điểm");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const submitData = {
        recruiterId: formData.recruiterId,
        title: formData.title,
        description: formData.description,
        headcount: parseInt(formData.headcount) || 1,
        minSalary: formData.minSalary ? parseInt(formData.minSalary) : undefined,
        maxSalary: formData.maxSalary ? parseInt(formData.maxSalary) : undefined,
        currency: formData.currency,
        cityId: formData.cityId,
      };

      const response = await fetch(`${apiUrl}/admin/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          recruiterId: recruiters.length > 0 ? recruiters[0].id : "",
          title: "",
          description: "",
          headcount: "1",
          minSalary: "",
          maxSalary: "",
          currency: "VND",
          cityId: cities.length > 0 ? cities[0].id : "",
        });
        
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Có lỗi xảy ra khi tạo việc làm");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      setError("Có lỗi xảy ra khi tạo việc làm");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const selectedRecruiter = recruiters.find(r => r.id === formData.recruiterId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Thêm việc làm mới</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Recruiter Selection */}
          <div>
            <Label htmlFor="recruiterId" className="text-sm font-medium text-gray-700">
              Nhà tuyển dụng *
            </Label>
            <Select
              value={formData.recruiterId}
              onValueChange={(value) => handleInputChange("recruiterId", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn nhà tuyển dụng" />
              </SelectTrigger>
              <SelectContent>
                {recruiters.map((recruiter) => (
                  <SelectItem key={recruiter.id} value={recruiter.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{recruiter.name}</span>
                      <span className="text-xs text-gray-500">
                        {recruiter.company ? recruiter.company.name : "Chưa có công ty"} • {recruiter.email}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRecruiter && selectedRecruiter.company && (
              <p className="text-xs text-gray-500 mt-1">
                Công ty: {selectedRecruiter.company.name}
              </p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Tiêu đề công việc *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="VD: Senior Frontend Developer"
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Mô tả công việc *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Nhập mô tả chi tiết về công việc..."
              className="mt-1"
              rows={6}
              required
            />
          </div>

          {/* Headcount and City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headcount" className="text-sm font-medium text-gray-700">
                Số lượng tuyển
              </Label>
              <Input
                id="headcount"
                type="number"
                min="1"
                value={formData.headcount}
                onChange={(e) => handleInputChange("headcount", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cityId" className="text-sm font-medium text-gray-700">
                Địa điểm *
              </Label>
              <Select
                value={formData.cityId}
                onValueChange={(value) => handleInputChange("cityId", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Mức lương</Label>
            <div className="grid grid-cols-3 gap-4 mt-1">
              <Input
                type="number"
                placeholder="Từ"
                value={formData.minSalary}
                onChange={(e) => handleInputChange("minSalary", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Đến"
                value={formData.maxSalary}
                onChange={(e) => handleInputChange("maxSalary", e.target.value)}
              />
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Để trống nếu mức lương "Thỏa thuận"
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </div>
              ) : (
                "Tạo việc làm"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
