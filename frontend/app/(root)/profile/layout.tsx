import ProfileHeader from "@/components/sections/profile/HelloUser";
import ProfileMenu from "@/components/sections/profile/ProfileMenu";


// app/profile/layout.tsx
export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center py-8 px-20 bg-[#F3F5F7] ">
      {/* Sidebar */}
      <div className="w-[20%] flex flex-col gap-6">
        <ProfileHeader nameUser={"Thịnh Zuy"} />
        <ProfileMenu/>
      </div>

      {/* Content */}
      <div className="w-[80%]">{children}</div>
    </div>
  );
}