'use client'
import FilterDropdown from "./FilterDropdown";
import FilterButton from "./FilterButton";
import FilterArrowsLeft from "./FilterArrowLeft";
import FilterArrowsRight from "./FilterArrowRight";
import SectionHeader from "./SectionHeader";
import { useState } from "react";

export type LocationFilter = "Ngẫu nhiên" | "Hà Nội" | "TP.Hồ Chí Minh" | "Miền Nam";

const LOCATION_FILTERS: LocationFilter[] = ["Ngẫu nhiên", "Hà Nội", "TP.Hồ Chí Minh", "Miền Nam"];

interface FilterBarProps {
  onFilterChange?: (filter: LocationFilter) => void;
  initialFilter?: LocationFilter;
}

export default function FilterBar({ onFilterChange, initialFilter = "Ngẫu nhiên" }: FilterBarProps) {
  const [active, setActive] = useState<LocationFilter>(initialFilter);

  const handleClick = (filter: LocationFilter) => {
    setActive(filter);
    onFilterChange?.(filter);
  };

  return (
    <div>
      <SectionHeader />
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-3">
          <FilterDropdown
            label="Địa điểm"
            options={["Mức lương", "Kinh nghiệm", "Ngành nghề"]}
          />
        </div>

        <div className="flex items-center justify-center gap-3 flex-1">
          <FilterArrowsLeft />
          {LOCATION_FILTERS.map((filter) => (
            <FilterButton
              key={filter}
              label={filter}
              active={active === filter}
              onClick={() => handleClick(filter)}
            />
          ))}
          <FilterArrowsRight />
        </div>
      </div>
    </div>
  );
}
