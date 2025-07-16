"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { createPopper, type Instance } from "@popperjs/core";

interface DropdownProps {
  dropdownButton: React.ReactNode;
  dropdownContent: React.ReactNode;
}

const TableDropdown: React.FC<DropdownProps> = ({
  dropdownButton,
  dropdownContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popperInstanceRef = useRef<Instance | null>(null);

  const close = (event: MouseEvent) => {
    const target = event.target as Node;
    if (buttonRef.current && contentRef.current) {
      const dropdown = buttonRef.current.closest("div");
      if (dropdown && !dropdown.contains(target)) {
        setIsOpen(false);
      }
    }
  };

  const toggle = () => {
    setIsOpen(!isOpen);
    if (popperInstanceRef.current) {
      popperInstanceRef.current.update();
    }
  };

  useEffect(() => {
    document.addEventListener("click", close);

    if (buttonRef.current && contentRef.current) {
      popperInstanceRef.current = createPopper(
        buttonRef.current,
        contentRef.current,
        {
          placement: "bottom-end",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 4],
              },
            },
          ],
        }
      );
    }

    return () => {
      document.removeEventListener("click", close);
      if (popperInstanceRef.current) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div onClick={toggle} ref={buttonRef}>
        {dropdownButton}
      </div>
      <div className="z-10" ref={contentRef}>
        <div
          style={{ display: isOpen ? "block" : "none" }}
          className="p-2 bg-white border border-gray-200 rounded-2xl shadow-lg dark:border-gray-800 dark:bg-gray-900 w-40"
        >
          <div
            className="space-y-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {dropdownContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDropdown;
