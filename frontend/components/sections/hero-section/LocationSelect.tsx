'use client'

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface LocationSelect {
  label: string;
  options: string[];
}

export default function LocationSelect({ label, options }: LocationSelect) {
  const [choose, setChoose] = useState(label);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative"> 
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-6 bg-white border border-gray-300 rounded-full hover:border-blue-500 transition-colors"
      >
        <span className="text-gray-700 font-semibold ">{choose}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
         <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <Button
              key={option}
              onClick={() => {
                setChoose(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-6 hover:bg-blue-50 transition-colors font-semibold"
            >
              {option}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
