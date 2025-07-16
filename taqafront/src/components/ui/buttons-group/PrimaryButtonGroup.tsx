import React from "react";

export default function PrimaryButtonGroup() {
  return (
    <div className="max-w-full pb-3 overflow-x-auto custom-scrollbar xsm:pb-0">
      <div className="min-w-[309px]">
        <div className="inline-flex items-center shadow-theme-xs">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition bg-brand-500 ring-1 ring-inset ring-brand-500 first:rounded-l-lg last:rounded-r-lg hover:bg-brand-500"
          >
            Button Text
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-3 -ml-px text-sm font-medium bg-transparent text-brand-500 ring-1 ring-inset ring-brand-500 first:rounded-l-lg last:rounded-r-lg hover:bg-brand-500 hover:text-white"
          >
            Button Text
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-3 -ml-px text-sm font-medium bg-transparent text-brand-500 ring-1 ring-inset ring-brand-500 first:rounded-l-lg last:rounded-r-lg hover:bg-brand-500 hover:text-white"
          >
            Button Text
          </button>
        </div>
      </div>
    </div>
  );
}
