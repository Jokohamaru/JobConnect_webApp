"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Grid, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterDropdownProps {
  label: string;
  options: string[];
}

export default function FilterDropdown({
  label,
  options,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-10 py-6 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
      >
        <Grid className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700  font-semibold">Dựa trên: {selected}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>
      {isOpen && (
        <div>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[90%] left-2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <Button
                key={option}
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-6 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition-colors font-semibold"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
