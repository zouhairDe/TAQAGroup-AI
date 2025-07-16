import React from "react";
import { Tooltip } from "./Tooltip";
import Button from "../button/Button";

export default function DefaultTooltip() {
  return (
    <Tooltip content="This is a top tooltip" position="top">
      <Button size="sm">Tooltip Top</Button>
    </Tooltip>
  );
}
