"use client";

import { Lightbulb } from "lucide-react";
import { X } from "lucide-react";
import { useState } from "react";
export default function HintBar() {
  const [isClose, setClose] = useState(true);
  return (
    <div>
      {isClose && (
        <div className="flex justify-between bg-[#EDFBFE] border border-blue-200 items-center m-auto py-3 px-2 mt-7">
          <div className="flex ">
            <Lightbulb className="text-blue-500" />
            <p className="font-semibold pl-3">Gợi ý:</p>
            <p className="ml-2">Di chuyển vào tiêu đề việc làm để xem khai quát công việc</p>
          </div>
          <X
            onClick={() => setClose(false)}
            className="text-blue-500 cursor-pointer hover:text-blue-800"
          />
        </div>
      )}
    </div>
  );
}
