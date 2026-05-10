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
    <div className="relative "> 
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-full px-6 bg-transparent hover:bg-transparent rounded-l-full focus-visible:ring-0"
      >
        <span className="text-gray-700 font-semibold">{choose}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
         <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setChoose(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors font-semibold text-gray-700"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
