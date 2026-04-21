
"use client";

import Image from "next/image";
import { CircleArrowRight } from 'lucide-react';
import Link from "next/link";

interface CV {
  id: number;
  title: string;
  thumbnail: string;
}

export default function UserCVSection({ title, thumbnail }: CV) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Hồ sơ của bạn</h3>

      {/* CV Grid */}
      <div className="flex gap-3">
        <div className=" h-50 w-40 bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
          {/* CV Thumbnail */}
          <div className="  mb-3">
            <Image
              src={thumbnail || "https://i.pravatar.cc/40"}
              alt={title}
              width={100}
              height={200}
              className="object-cover"
            />
          </div>
        </div>
        <div className=" h-50 w-40  bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
          {/* CV Thumbnail */}
          <div className="">
            <Image
              src={thumbnail || "https://i.pravatar.cc/40"}
              alt={title}
              width={100}
              height={200}
              className="object-cover"
            />
          </div>    
        </div>
        <div className=" text-[13px]  h-50 w-40 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
          {/* CV Thumbnail */}
          <Link href="" className="">
            Khám phá mẫu CV <CircleArrowRight  className="mx-auto text-[#2587C7]"/>
          </Link>    
        </div>  
      </div>
    </div>
  );
}
