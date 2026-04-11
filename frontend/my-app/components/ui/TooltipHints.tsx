'use client'

import { Lightbulb } from "lucide-react";
import { X } from "lucide-react";
import { useState } from "react";
export default function HintBar() {
  const [isClose, setClose] = useState(true);
  return (
    <div>
      {isClose && (
        <div className="flex justify-between bg-[#EDFBFE] border border-blue-200 items-center w-[90%] m-auto py-3 px-2 mt-7">
          <p className="flex ">
            <Lightbulb className="text-blue-500" />
            Gợi ý: Di chuyển vào tiêu đề việc làm để xem khai quát công việc
          </p>
          <X onClick={() => setClose(false)} className="text-blue-500 cursor-pointer hover:text-blue-800" />
        </div>
      )}
    </div>
  );
}
