import React from "react";
import ComponentCard from "../../common/ComponentCard";
import RoundedRibbon from "./RoundedRibbon";
import RibbonWithHover from "./RibbonWithHover";
import RibbonWithShape from "./RibbonWithShape";
import FilledRibbon from "./FilledRibbon";

export default function RibbonExample() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
      <ComponentCard title="Rounded Ribbon">
        <RoundedRibbon />
      </ComponentCard>
      <ComponentCard title="Ribbon in Hover">
        <RibbonWithShape />
      </ComponentCard>
      <ComponentCard title="Filled Ribbon">
        <FilledRibbon />
      </ComponentCard>
      <ComponentCard title="Ribbon in Hover">
        <RibbonWithHover />
      </ComponentCard>
    </div>
  );
}
