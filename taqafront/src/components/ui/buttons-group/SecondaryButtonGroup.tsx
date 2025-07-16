import React from "react";

export default function SecondaryButtonGroup() {
  return (
    <div className="max-w-full pb-3 overflow-x-auto custom-scrollbar xsm:pb-0">
      <div className="min-w-[309px]">
        <div className="inline-flex items-center shadow-theme-xs">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 ring-1 ring-inset ring-gray-300 transition first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 dark:bg-white/[0.03] dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            Button Text
          </button>
          <button
            type="button"
            className="-ml-px inline-flex items-center gap-2 bg-transparent px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 hover:text-gray-800 dark:bg-transparent dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            Button Text
          </button>
          <button
            type="button"
            className="-ml-px inline-flex items-center gap-2 bg-transparent px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition first:rounded-l-lg last:rounded-r-lg hover:bg-gray-50 hover:text-gray-800 dark:bg-transparent dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            Button Text
          </button>
        </div>
      </div>
    </div>
  );
}
