import ComponentCard from "@/components/common/ComponentCard";
import React from "react";
import CustomLink from "./Link";

export default function DefaultLinkExample() {
  return (
    <ComponentCard title="Colored Links">
      <div className="flex flex-col space-y-3">
        <CustomLink href="/" variant="colored" color="primary">
          Primary link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="secondary">
          Secondary link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="success">
          Success link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="danger">
          Danger link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="warning">
          Warning link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="info">
          Info link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="light">
          Light link
        </CustomLink>
        <CustomLink href="/" variant="colored" color="dark">
          Dark link
        </CustomLink>
      </div>
    </ComponentCard>
  );
}
