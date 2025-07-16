import ComponentCard from "@/components/common/ComponentCard";

import React from "react";
import CustomLink from "./Link";

export default function CustomLinkOpacityExample() {
  return (
    <ComponentCard title=" CustomLink Opacity">
      <div className="flex flex-col space-y-3">
        <CustomLink href="/" variant="opacity" opacity={10}>
          Link opacity 10
        </CustomLink>
        <CustomLink href="/" variant="opacity" opacity={25}>
          Link opacity 25
        </CustomLink>
        <CustomLink href="/" variant="opacity" opacity={50}>
          CustomLink opacity 50
        </CustomLink>
        <CustomLink href="/" variant="opacity" opacity={75}>
          Link opacity 75
        </CustomLink>
        <CustomLink href="/" variant="opacity" opacity={100}>
          Link opacity 100
        </CustomLink>
      </div>
    </ComponentCard>
  );
}
