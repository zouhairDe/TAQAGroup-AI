import React from "react";

export default function RibbonWithHover() {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
      <span className="after:bottom-0-0 group absolute -left-px mt-3 flex -translate-x-[55px] items-center gap-1 bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition-transform duration-500 ease-in-out before:absolute before:-right-4 before:top-0 before:border-[16px] before:border-transparent before:border-l-brand-500 before:border-t-brand-500 before:content-[''] after:absolute after:-right-4 after:border-[16px] after:border-transparent after:border-b-brand-500 after:border-l-brand-500 after:content-[''] group-hover:translate-x-0">
        <span className="transition-opacity duration-300 ease-linear opacity-0 group-hover:opacity-100">
          Popular
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.679 2.2915L3.98828 11.6958H9.32224L9.32224 17.7082L16.013 8.30385L10.679 8.30385V2.2915Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="p-5 pt-16">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lorem ipsum dolor sit amet consectetur. Eget nulla suscipit arcu
          rutrum amet vel nec fringilla vulputate. Sed aliquam fringilla
          vulputate imperdiet arcu natoque purus ac nec ultricies nulla
          ultrices.
        </p>
      </div>
    </div>
  );
}
