'use client';
import { CVSections } from "./CVSections";
import ProfileHeader from "./ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";

export default function MyFileSection() {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-5xl mx-auto px-4 ">
        <ProfileHeader
          user={{
            id: String(user?.id) || "",
            name: profileData
              ? `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim()
              : user?.fullName || "",
            email: profileData?.email || user?.email || "",
            avatarUrl: profileData?.avaUrl || user?.avaUrl || "",
            phoneNumber: profileData?.candidate?.phoneNumber || "",
          }}
          onProfileUpdate={handleProfileUpdate}
        />
        <CVSections />
      </div>
    </div>
  );
}

