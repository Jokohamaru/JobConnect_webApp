'use client'
import FilterDropdown from "./FilterDropdown";
import FilterButton from "./FilterButton";
import FilterArrows from "./FilterArrowLeft";
import SectionHeader from "./SectionHeader";
import FilterArrowsLeft from "./FilterArrowLeft";
import FilterArrowsRight from "./FilterArrowRight";
import { useState } from "react";

export default function FilterBar() {
  const [active, setActive] = useState("Ngẫu nhiên")
  return (
    <div >
      <SectionHeader />
      <div className="flex items-center justify-center gap-4  py-2">
        <div className="flex items-center  gap-3">
          <FilterDropdown
            label="Địa điểm"
            options={["Mức lương", "Kinh nghiệm", "Ngành nghề"]}
          />
        </div>

        <div className="flex items-center justify-center gap-3 flex-1">
          <FilterArrowsLeft />
          <FilterButton label="Ngẫu nhiên" active={active === "Ngẫu nhiên"} onClick={() => setActive("Ngẫu nhiên")} />
          <FilterButton label="Hà Nội" active={active === "Hà Nội"} onClick={() => setActive("Hà Nội")}  />
          <FilterButton label="TP.Hồ Chí Minh" active={active === "TP.Hồ Chí Minh"} onClick={() => setActive("TP.Hồ Chí Minh")} />
          <FilterButton label="Miền Nam" active={active === "Miền Nam"} onClick={() => setActive("Miền Nam")} />
          <FilterArrowsRight />
        </div>
      </div>
    </div>
  );
}
