import React from "react";

export default function RibbonWithShape() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
      <span className="after:bottom-0-0 absolute -left-px mt-3 inline-block bg-brand-500 px-4 py-1.5 text-sm font-medium text-white before:absolute before:-right-4 before:top-0 before:border-[13px] before:border-transparent before:border-l-brand-500 before:border-t-brand-500 before:content-[''] after:absolute after:-right-4 after:border-[13px] after:border-transparent after:border-b-brand-500 after:border-l-brand-500 after:content-['']">
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
