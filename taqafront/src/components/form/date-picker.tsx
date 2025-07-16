"use client";

import { useEffect, forwardRef } from "react";
import flatpickr from "flatpickr";
import { French } from "flatpickr/dist/l10n/fr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalendarIcon } from "@/icons/CalendarIcon";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id?: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (date: Date | null) => void;
  defaultDate?: DateOption;
  selected?: Date | null;
  label?: string;
  placeholder?: string;
  placeholderText?: string;
  enableTime?: boolean;
  dateFormat?: string;
  className?: string;
};

const DatePicker = forwardRef<HTMLInputElement, PropsType>(({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  selected,
  placeholder,
  placeholderText,
  enableTime = false,
  dateFormat,
  className,
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);

  useEffect(() => {
    const flatPickr = flatpickr(`#${inputId}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: dateFormat || (enableTime ? "Y-m-d H:i" : "Y-m-d"),
      defaultDate: selected || defaultDate,
      onChange: (dates) => {
        if (onChange) {
          onChange(dates[0] || null);
        }
      },
      locale: French,
      enableTime,
      time_24hr: true,
      allowInput: true,
      disableMobile: false,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, inputId, defaultDate, selected, enableTime, dateFormat]);

  return (
    <div>
      {label && <Label htmlFor={inputId}>{label}</Label>}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          placeholder={placeholderText || placeholder || "Sélectionner une date"}
          className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 ${className || ''}`}
          value={selected ? selected.toISOString().split('T')[0] : ''}
          readOnly
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalendarIcon className="size-6" />
        </span>
      </div>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export { DatePicker };
export default DatePicker;
