import React from "react";

export default function PopoverWithLink() {
  return (
    <div className="max-w-full overflow-auto custom-scrollbar sm:overflow-visible">
      <div className="min-w-[750px]">
        <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:gap-5">
          <div>
            <button className="inline-flex px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
              Popover on Bottom
            </button>
          </div>{" "}
          <div>
            <button className="inline-flex px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
              Popover on Right
            </button>
          </div>{" "}
          <div>
            <button className="inline-flex px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
              Popover on Left
            </button>
          </div>{" "}
          <div>
            <button className="inline-flex px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
              Popover on Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
