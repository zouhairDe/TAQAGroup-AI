import React from "react";

export default function UnOrderedList() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:w-fit">
      <ul className="flex flex-col ">
        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span className="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"></span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span className="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"></span>

          <span> It is a long established fact reader </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span className="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"></span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span className="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"></span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span className="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"></span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>
      </ul>
    </div>
  );
}
