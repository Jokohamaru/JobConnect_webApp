import Image from "next/image";
import Link from "next/link";

export function MarketingInfo() {
  return (
    <div>
      <div className="flex items-center justify-center gap-10 p-2">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo-marketing1.png"
            alt="logo"
            width={30}
            height={30}
            className="object-contain"
          />
          <Link className="text-[16px] font-bold tracking-wider" href="">
            Mức lương & Thị trường tuyển dụng 2026–2027
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-[16px] tracking-wider" href="">
            Xu hướng mới từ công nghệ và nhu cầu nhân sự
          </Link>
          <Image
            src="/images/logo-marketing2.png"
            alt="logo"
            width={30}
            height={30}
            className="object-contain"
          />
        </div>
      </div>
      <hr className="w-[90%] m-auto" />
    </div>
  );
}
