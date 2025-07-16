import React from "react";
import Input from "../input/InputField";

export default function UrlPrefixInput() {
  return (
    <div className="relative">
      <span className="absolute left-0 top-1/2 inline-flex h-11 -translate-y-1/2 items-center justify-center border-r border-gray-200 py-3 pl-3.5 pr-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
        http://
      </span>

      <Input type="url" placeholder="www.tailadmin.com" className="pl-[90px]" />
    </div>
  );
}
