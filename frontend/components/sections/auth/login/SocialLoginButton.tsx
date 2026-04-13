import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function SocialLoginButton() {
    return(
        <div className="border border-[#83BBE0] w-full rounded-lg hover:bg-blue-100">
            <Link className="flex items-center justify-center px-6 py-2 gap-3"  href="">
                <Image src="/google.svg" alt="google" width={24} height={24} />
                <p className="text-[#1F84C9] font-bold">Đăng nhập bằng Google</p>
            </Link>
        </div>
    )
}