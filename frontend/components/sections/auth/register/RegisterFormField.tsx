// components/auth/RegisterFormFields.tsx
'use client'

import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RegisterFormFieldsProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (value: boolean) => void;
  errors?: Record<string, string>;
}

export default function RegisterFormFields({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  agreedToTerms,
  setAgreedToTerms,
  errors = {}
}: RegisterFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-3">

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="block text-gray-700 text-sm font-medium mb-2">
            Họ
          </Label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.firstName ? 'text-red-500' : 'text-blue-500'}`} />
            <Input
              type="text"
              placeholder="Nhập Họ"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-6 py-5 pl-12 border ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
              required
            />
          </div>
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <Label className="block text-gray-700 text-sm font-medium mb-2">
            Tên
          </Label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.lastName ? 'text-red-500' : 'text-blue-500'}`} />
            <Input
              type="text"
              placeholder="Nhập Tên"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-6 py-5 pl-12 border ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
              required
            />
          </div>
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>


      <div>
        <Label className="block text-gray-700 text-sm font-medium mb-2">
          Email
        </Label>
        <div className="relative">
          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-blue-500'}`} />
          <Input
            type="email"
            placeholder="Nhập Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-6 py-5 pl-12 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
            required
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>} 
      </div>

   
      <div>
        <Label className="block text-gray-700 text-sm font-medium mb-2">
          Mật khẩu
        </Label>
        <div className="relative">
          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-500' : 'text-blue-500'}`} />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-6 py-5 pl-12 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
            required
          />
          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent hover:bg-transparent"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </Button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>


      <div>
        <Label className="block text-gray-700 text-sm font-medium mb-2">
          Xác nhận mật khẩu
        </Label>
        <div className="relative">
          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.confirmPassword ? 'text-red-500' : 'text-blue-500'}`} />
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Xác nhận lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-6 py-5 pl-12 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
            required
          />
          <Button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent hover:bg-transparent"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>


      <div>
        <div className="flex items-start gap-2">
          <Input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className={`mt-1 w-4 h-4 text-blue-600 ${errors.agreedToTerms ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-blue-500`}
            required
          />
          <Label htmlFor="terms" className="text-sm text-gray-600">
            Tôi đã đọc và đồng ý với{' '}
            <Link href="/terms" className="text-blue-500 underline">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-blue-500 underline">
              Chính sách bảo mật
            </Link>{' '}
            của JobConnect
          </Label>
        </div>
        {errors.agreedToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreedToTerms}</p>}
      </div>
    </div>
  );
}