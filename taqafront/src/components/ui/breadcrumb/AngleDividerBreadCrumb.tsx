import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Breadcrumb from "./Breadcrumb";

export default function AngleDividerBreadCrumb() {
  // Two-layer breadcrumb items
  const twoLayerItems = [{ label: "Home", href: "/" }, { label: "UI Kits" }];

  // Three-layer breadcrumb items
  const threeLayerItems = [
    { label: "Home", href: "/" },
    { label: "UI Kits", href: "/ui-kits" },
    { label: "Avatar" },
  ];
  return (
    <ComponentCard title="Breadcrumb With Icon">
      <div className="space-y-5">
        <div>
          <Breadcrumb items={twoLayerItems} variant="chevron" />
        </div>

        <div>
          <Breadcrumb items={threeLayerItems} variant="chevron" />
        </div>
      </div>
    </ComponentCard>
  );
}
