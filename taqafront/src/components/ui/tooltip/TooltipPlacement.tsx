import React from "react";
import { Tooltip } from "./Tooltip";
import Button from "../button/Button";

export default function TooltipPlacement() {
  return (
    <div className="flex flex-col items-center gap-10 sm:flex-row">
      <Tooltip content="This is a top tooltip" position="top">
        <Button size="sm">Tooltip Top</Button>
      </Tooltip>

      <Tooltip content="This is a right tooltip" position="right">
        <Button size="sm">Tooltip Right</Button>
      </Tooltip>

      <Tooltip content="This is a bottom tooltip" position="bottom">
        <Button size="sm">Tooltip Bottom</Button>
      </Tooltip>

      <Tooltip content="This is a left tooltip" position="left">
        <Button size="sm">Tooltip Left</Button>
      </Tooltip>
    </div>
  );
}
