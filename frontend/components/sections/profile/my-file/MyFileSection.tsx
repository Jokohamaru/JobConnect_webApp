
'use client'
import { CVSections } from "./CVSections";
import ProfileHeader from "./ProfileHeader";
import { useAuth } from "@/context/AuthContext";


export default function MyFileSection() {
  const { user } = useAuth();
  return (
    <div className="min-w-4xl mx-auto px-4">
      <ProfileHeader user={{
        id: String(user?.id) || "",
        name: user?.fullName || "",
        email: user?.email || "",
        avatarUrl: ""
      }} />
      <div className="flex flex-col gap-4">
        <CVSections />
      </div>
    </div>
  );
}
