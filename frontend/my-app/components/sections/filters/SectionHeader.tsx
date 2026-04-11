import Image from "next/image";
import Link from "next/link";

export default function SectionHeader() {
  return (
    <div className="flex justify-between px-20 items-center">
      <div className="relative flex items-center gap-5 py-5">
         <p className="text-3xl text-[#1F84C5] font-bold border-black border-r-2 pr-5 whitespace-nowrap">
          Việc làm trending
        </p>

        <Image
          src="/images/logo-jobconnect.png"
          alt="logo"
          width={170}
          height={170}
          className="absolute left-72.5 top-1/2 -translate-y-1/2"
        />
      </div>

      <div>
        <Link href="" className="underline italic text-[#4B8AF2]">Xem tất cả</Link>
      </div>
    </div>
  );
}
