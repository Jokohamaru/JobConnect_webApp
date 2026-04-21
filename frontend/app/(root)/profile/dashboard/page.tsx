import UserProfileSection from "@/components/sections/profile/dashboard/UserProfileSection";

export default function DashBoard() {
    return(
        <div>
            <UserProfileSection user={{
                name: "Thinh Zuy",
                email: "thanh@gmail.com",
                avatarUrl: undefined
            }} />
        </div>
    )
}