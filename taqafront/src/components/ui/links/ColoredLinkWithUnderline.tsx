import ComponentCard from "@/components/common/ComponentCard";
import React from "react";
import CustomLink from "./Link";

export default function ColoredCustomLinkWithUnderline() {
  return (
    <ComponentCard title="Colored CustomLinks with Underline">
      <div className="flex flex-col space-y-3">
        <CustomLink href="/" variant="underline" color="primary">
          Primary CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="secondary">
          Secondary CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="success">
          Success CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="danger">
          Danger CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="warning">
          Warning CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="info">
          Info CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="light">
          Light CustomLink
        </CustomLink>
        <CustomLink href="/" variant="underline" color="dark">
          Dark CustomLink
        </CustomLink>
      </div>
    </ComponentCard>
  );
}
