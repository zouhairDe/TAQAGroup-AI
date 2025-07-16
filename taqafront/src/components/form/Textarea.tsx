import React from "react";

interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  defaultValue,
  onChange,
  className = "",
  rows = 4,
  disabled = false,
  required = false,
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      required={required}
      className={`w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800 resize-none ${className}`}
    />
  );
};

export default Textarea; 