import Image from "next/image";

export default function LoginHeader() {
  return (
    <div className="pt-3">
      <div className="flex items-center">
        <div className="text-[#1F84C5] font-bold text-[25px]">
            <p>Chào mừng</p>
            <p>quay trở lại</p>
        </div>
        <Image
          src="/images/Logo_Job_Connect_3-removebg-preview.png"
          alt="JobConnect"
          width={170}
          height={40}
          className="object-contain"
        />
      </div>
    </div>
  );
}
