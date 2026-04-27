'use client'
import UserProfileSection from "@/components/sections/profile/dashboard/UserProfileSection";
import { useAuth } from "@/context/AuthContext";

export default function DashBoard() {
    const {user} = useAuth();
    return(
        <div>
            <UserProfileSection user={{
                id: String(user?.id) || "",
                name: user?.fullName || "",
                email: user?.email || "",
                avatarUrl: undefined
            }} />
        </div>
    )
}