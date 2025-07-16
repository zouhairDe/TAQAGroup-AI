import React from "react";
import ComponentCard from "../../common/ComponentCard";
import PrimaryButtonGroup from "./PrimaryButtonGroup";
import ButtonGroupWithLeftIcon from "./ButtonGroupWithLeftIcon";
import ButtonGroupWithRightIcon from "./ButtonGroupWithRightIcon";
import SecondaryButtonGroup from "./SecondaryButtonGroup";
import SecondaryButtonGroupWithLeftIcon from "./SecondaryButtonGroupWithLeftIcon";
import SecondaryButtonGroupWithRightIcon from "./SecondaryButtonGroupWithRightIcon";

export default function ButtonGroupExample() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <ComponentCard title="Primary Button Group">
        <PrimaryButtonGroup />
      </ComponentCard>
      <ComponentCard title="Primary Button Group with Left Icon">
        <ButtonGroupWithLeftIcon />
      </ComponentCard>
      <ComponentCard title="Primary Button Group with Right Icon">
        <ButtonGroupWithRightIcon />
      </ComponentCard>
      <ComponentCard title="Secondary Button Group">
        <SecondaryButtonGroup />
      </ComponentCard>
      <ComponentCard title="Secondary Button Group with Left Icon">
        <SecondaryButtonGroupWithLeftIcon />
      </ComponentCard>
      <ComponentCard title="Secondary Button Group with Right Icon">
        <SecondaryButtonGroupWithRightIcon />
      </ComponentCard>
    </div>
  );
}
