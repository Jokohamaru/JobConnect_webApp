import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterButton({ label, active = false, onClick }: FilterButtonProps) {

  return (
    <Button
      onClick={onClick}
      className={`
        px-6 py-6 rounded-full transition-all whitespace-nowrap font-semibold
        ${active 
          ? 'bg-[#0E7BC3] text-white shadow-md' 
          : 'bg-white text-gray-700 border border-gray-300 hover:border-[#0E7BC3] hover:text-[#0E7BC3]'
        }
      `}
    >
      {label}
    </Button>
  );
}