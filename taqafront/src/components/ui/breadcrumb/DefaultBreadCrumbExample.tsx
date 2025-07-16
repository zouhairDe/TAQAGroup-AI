import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Breadcrumb from "./Breadcrumb";

export default function DefaultBreadCrumbExample() {
  // Two-layer breadcrumb items
  const twoLayerItems = [{ label: "Home", href: "/" }, { label: "UI Kits" }];

  // Three-layer breadcrumb items
  const threeLayerItems = [
    { label: "Home", href: "/" },
    { label: "UI Kits", href: "/ui-kits" },
    { label: "Avatar" },
  ];
  return (
    <ComponentCard title="Default Breadcrumb">
      <div className="space-y-5">
        {/* <!--  Breadcrumb item--> */}
        <div>
          <Breadcrumb items={twoLayerItems} />
        </div>

        {/* <!--  Breadcrumb item--> */}
        <div>
          <Breadcrumb items={threeLayerItems} />
        </div>
      </div>
    </ComponentCard>
  );
}
