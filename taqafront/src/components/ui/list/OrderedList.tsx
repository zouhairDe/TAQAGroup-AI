import React from "react";

export default function OrderedList() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:w-fit">
      <ol className="flex flex-col list-decimal">
        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span> 1. Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span> 2. It is a long established fact reader </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span> 3. Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span> 4. Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400">
          <span> 5. Lorem ipsum dolor sit amet </span>
        </li>
      </ol>
    </div>
  );
}
