"use client";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { TrendingTag } from "./TrendingTag";
import LocationSelect from "./LocationSelect";
import { useState } from "react";

export function SearchBar() {
  const [input, setInput] = useState("");
  return (
    <div className="bg-linear-to-b  from-[#2e7ab1] via-[#79C2ED] to-[#B0E6FF] to-90% flex flex-col items-center gap-8 py-15">
      <p className="text-3xl text-white font-bold text-center">
        Job Connect - Tạo CV bằng AI, Tìm Việc Làm, Tuyển dụng hiệu quả
      </p>

      <div className="flex items-center gap-4 bg-transparent">
        <LocationSelect label="Địa điểm" options={["Hà Nội", "Hải Phòng"]} />

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-12.5 w-100 rounded-full bg-white border-none px-6  text-[18px] font-semibold"
          placeholder="Vị trí muốn tuyển dụng hoặc tên công ty"
        />

        <Button className="h-12.5 px-10 rounded-full bg-[#1F84C5] hover:bg-blue-900 text-white cursor-pointer font-semibold">
          Tìm kiếm
        </Button>
      </div>

      <TrendingTag />
    </div>
  );
}
