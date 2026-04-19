// components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import RegisterHeader from "./RegisterHeader";
import RegisterFormFields from "./RegisterFormField";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-white rounded-2xl  w-full flex">
      <div className=" px-20 py-30 w-[70%] max-h-screen ">
        <RegisterHeader />

        <form>
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
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-5 bg-[#0E7BC3] text-white  rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Đăng Ký"}
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
