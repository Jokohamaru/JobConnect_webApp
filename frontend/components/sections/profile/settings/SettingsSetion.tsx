"use client";

// app/account/page.tsx
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { AccountInfoCard } from "./AccountInfoCard";
import { PasswordCard } from "./PasswordCard";
import { CVSearchCard } from "./CVSearchCard";
import { DeleteAccountCard } from "./DeleteAccountCard";
export default function AccountSettingsPage() {
  const [cvEnabled, setCvEnabled] = useState(true);

  return (
    <div className="flex flex-col  mx-auto px-4">
      <Separator />

      {/* 1 — Account info */}
      <AccountInfoCard email="wtfking54@gmail.com" fullName="Thành Nguyễn" />

      {/* 2 — Password */}
      <PasswordCard />

      {/* 3 — CV search */}
      <CVSearchCard
        enabled={cvEnabled}
        onToggle={() => setCvEnabled((v) => !v)}
      />

      {/* 4 — Delete account */}
      <DeleteAccountCard onDelete={() => alert("Tài khoản đã bị xoá!")} />
    </div>
  );
}
