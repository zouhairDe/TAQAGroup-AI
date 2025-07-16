"use client";
import React, { useState } from "react";
import Checkbox from "../../form/input/Checkbox";

export default function ListWithCheckbox() {
  // State to manage individual checkbox values
  const [checkedItems, setCheckedItems] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Handler to toggle individual checkboxes
  const handleCheckboxChange = (index: number, value: boolean) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = value;
    setCheckedItems(updatedCheckedItems);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:w-fit">
      <ul className="flex flex-col">
        {[
          "Lorem ipsum dolor sit amet",
          "It is a long established fact reader",
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
          "Lorem ipsum dolor sit amet",
        ].map((item, index) => {
          const id = `listCheckbox${index}`; // Unique ID for each checkbox
          return (
            <li
              key={index}
              className="border-b border-gray-200 px-3 py-2.5 last:border-b-0 dark:border-gray-800"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={id} // Pass unique id to checkbox
                  checked={checkedItems[index]}
                  onChange={(value) => handleCheckboxChange(index, value)}
                />
                <label
                  htmlFor={id} // Use the same id for the label
                  className="flex items-center text-sm text-gray-500 cursor-pointer select-none dark:text-gray-400"
                >
                  {item}
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
