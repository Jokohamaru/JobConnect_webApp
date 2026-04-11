'use client'
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
export default function TopBanner() {
  const [isClose, setClose] = useState(true);
  return (
    <div>
      {isClose && (
        <div className="flex justify-between items-center  text-[18px] bg-linear-to-r from-[#3C398E] via-[#6686B9] to-[#9DD0EA]  text-white">
          <div className="flex gap-10 m-auto">
            <p>
              Tìm kiếm công việc tương lai của bạn với tính năng khám phá việc
              làm bằng AI
            </p>
            <Link className="flex gap-2" href="#">
              ➤ <p className="underline">Tìm hiểu thêm</p>
            </Link>
          </div>
          <Button
            onClick={() => setClose(false)}
            className="px-5 text-blue-600 text-2xl flex items-center cursor-pointer hover:text-blue-800"
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
