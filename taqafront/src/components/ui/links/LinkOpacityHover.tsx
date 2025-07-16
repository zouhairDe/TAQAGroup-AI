import React from "react";

import ComponentCard from "@/components/common/ComponentCard";
import CustomLink from "./Link";

export default function LinkOpacityHover() {
  return (
    <ComponentCard title="Link Opacity Hover">
      <div className="flex flex-col space-y-3">
        <CustomLink href="/" variant="opacityHover" opacity={10}>
          Link opacity 10
        </CustomLink>
        <CustomLink href="/" variant="opacityHover" opacity={25}>
          Link opacity 25
        </CustomLink>
        <CustomLink href="/" variant="opacityHover" opacity={50}>
          Link opacity hover 50
        </CustomLink>
        <CustomLink href="/" variant="opacityHover" opacity={75}>
          Link opacity 75
        </CustomLink>
        <CustomLink href="/" variant="opacityHover" opacity={100}>
          Link opacity 100
        </CustomLink>
      </div>
    </ComponentCard>
  );
}
