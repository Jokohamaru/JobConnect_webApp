"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Eye, Building } from "lucide-react";
import Image from "next/image";

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CompanyFormData {
  name: string;
  size: string;
  nation: string;
  description: string;
  address: string;
  websiteUrl: string;
}

export function AddCompanyModal({ open, onClose, onSuccess }: AddCompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    size: "",
    nation: "",
    description: "",
    address: "",
    websiteUrl: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Vui lòng chọn file hình ảnh");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 5MB");
        return;
      }

      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên công ty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("size", formData.size);
      submitData.append("nation", formData.nation);
      submitData.append("description", formData.description);
      submitData.append("address", formData.address);
      submitData.append("websiteUrl", formData.websiteUrl);
      
      if (logo) {
        submitData.append("logo", logo);
      }

      const response = await fetch(`${apiUrl}/admin/companies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: submitData,
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: "",
          size: "",
          nation: "",
          description: "",
          address: "",
          websiteUrl: "",
        });
        setLogo(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Có lỗi xảy ra khi tạo công ty");
      }
    } catch (error) {
      console.error("Error creating company:", error);
      setError("Có lỗi xảy ra khi tạo công ty");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Thêm công ty mới</h2>
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

          {/* Logo Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Logo công ty</Label>
            <div className="mt-2">
              {logoPreview ? (
                <div className="relative inline-block">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={120}
                    height={120}
                    className="w-30 h-30 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Nhấp để tải lên logo công ty
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF tối đa 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Tên công ty *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nhập tên công ty"
              className="mt-1"
              required
            />
          </div>

          {/* Company Size */}
          <div>
            <Label htmlFor="size" className="text-sm font-medium text-gray-700">
              Quy mô công ty
            </Label>
            <Input
              id="size"
              type="text"
              value={formData.size}
              onChange={(e) => handleInputChange("size", e.target.value)}
              placeholder="VD: 50-100 nhân viên"
              className="mt-1"
            />
          </div>

          {/* Nation */}
          <div>
            <Label htmlFor="nation" className="text-sm font-medium text-gray-700">
              Quốc gia
            </Label>
            <Input
              id="nation"
              type="text"
              value={formData.nation}
              onChange={(e) => handleInputChange("nation", e.target.value)}
              placeholder="VD: Việt Nam"
              className="mt-1"
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Địa chỉ
            </Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Nhập địa chỉ công ty"
              className="mt-1"
            />
          </div>

          {/* Website URL */}
          <div>
            <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">
              Website
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Mô tả công ty
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Nhập mô tả về công ty..."
              className="mt-1"
              rows={4}
            />
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
                "Tạo công ty"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}