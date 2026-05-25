"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "CANDIDATE" as "CANDIDATE" | "RECRUITER" | "ADMIN",
    companyId: "" as string | undefined,
  });
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies for dropdown selection
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        const response = await fetch(`${apiUrl}/admin/companies?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setCompanies(result.data || []);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    if (open) {
      fetchCompanies();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const submitData = {
        ...formData,
        companyId: formData.role === "RECRUITER" && formData.companyId ? formData.companyId : undefined,
      };

      const response = await fetch(`${apiUrl}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      // Reset form
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "CANDIDATE",
        companyId: "",
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Thêm tài khoản mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Tối thiểu 6 ký tự"
              minLength={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Họ *</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Nguyễn"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Tên *</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Văn A"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "CANDIDATE" | "RECRUITER" | "ADMIN") =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CANDIDATE">Ứng viên</SelectItem>
                <SelectItem value="RECRUITER">Nhà tuyển dụng</SelectItem>
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Linked Company for Recruiter role */}
          {formData.role === "RECRUITER" && (
            <div className="space-y-2">
              <Label htmlFor="companyId">Công ty liên kết</Label>
              <Select
                value={formData.companyId || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn công ty liên kết" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
