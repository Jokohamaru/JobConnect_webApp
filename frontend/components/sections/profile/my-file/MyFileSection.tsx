'use client';
import { CVSections } from "./CVSections";
import ProfileHeader from "./ProfileHeader";
import { useAuth } from "@/context/AuthContext";

export default function MyFileSection() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-5xl mx-auto px-4 ">
        <ProfileHeader
          user={{
            id: String(user?.id) || "",
            name: user?.fullName || "",
            email: user?.email || "",
            avatarUrl: "",
          }}
        />
        <CVSections />
      </div>
    </div>
  );
}
