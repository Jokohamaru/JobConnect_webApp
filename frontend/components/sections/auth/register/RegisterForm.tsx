// components/auth/RegisterForm.tsx
"use client";

import { useState, useTransition } from "react";
import RegisterHeader from "./RegisterHeader";
import RegisterFormFields from "./RegisterFormField";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
    if (!confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
    }
    if (!agreedToTerms) newErrors.agreedToTerms = "Bạn phải đồng ý với điều khoản!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Thêm name (gửi lên từ fullName) và role mặc định là 1 (Ứng viên)
        body: JSON.stringify({ email, password, name: fullName, role: 1 }),
      });
      if (!response.ok) {
        throw new Error("Đăng ký thất bại");
      }

      startTransition(() => {
        router.push("/auth/login");
      });
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-2xl  w-full flex">
      <div className=" px-20 py-30 w-[70%] max-h-screen ">
        <RegisterHeader />

        <form onSubmit={handleRegister} noValidate>
          <RegisterFormFields
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            errors={errors}
          />

          <Button
            type="submit"
            disabled={loading || isPending}
            className="w-full mt-6 px-6 py-5 bg-[#0E7BC3] text-white  rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || isPending ? "Đang xử lý..." : "Đăng Ký"}
          </Button>
        </form>
      </div>
      <div className="w-1/2 relative max-h-screen">
        <Image
          src="/images/img-register.png"
          alt="registerbanner"
          fill
          sizes="50vw"
          quality={100}
          className="object-cover "
        />
      </div>
    </div>
  );
}
