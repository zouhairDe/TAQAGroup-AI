import React from "react";

export default function RoundedRibbon() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
      <span className="absolute -left-px mt-3 inline-block rounded-r-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white">
        Popular
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
