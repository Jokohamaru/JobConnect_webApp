import { SearchBar } from "@/components/sections/hero-section/SearchBar";
import FilterBar from "@/components/sections/filters/FilterBar";
import { MarketingInfo } from "@/components/sections/marketing-info";
import HintBar from "@/components/ui/TooltipHints";

export default function HomePage() {
  return (
    <div className="">
      <SearchBar />
      <MarketingInfo />
      <FilterBar />
      <HintBar />
    </div>
  );
}
