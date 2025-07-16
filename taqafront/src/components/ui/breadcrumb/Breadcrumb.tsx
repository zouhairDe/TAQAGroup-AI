import React from "react";
import Link from "next/link";

export const HomeIcon = () => (
  <svg
    className="fill-current"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.48994 3.61404C7.79216 3.38738 8.20771 3.38738 8.50993 3.61404L12.3433 6.48904C12.5573 6.64957 12.6833 6.9015 12.6833 7.16904V11.8333C12.6833 12.3028 12.3027 12.6833 11.8333 12.6833H8.64993V10.8333C8.64993 10.4744 8.35892 10.1833 7.99993 10.1833C7.64095 10.1833 7.34993 10.4744 7.34993 10.8333V12.6833H4.1666C3.69716 12.6833 3.3166 12.3028 3.3166 11.8333V7.16904C3.3166 6.9015 3.44257 6.64957 3.6566 6.48904L7.48994 3.61404ZM7.99478 13.9833H4.1666C2.97919 13.9833 2.0166 13.0207 2.0166 11.8333V7.16904C2.0166 6.49231 2.33522 5.85508 2.8766 5.44904L6.70994 2.57404C7.47438 2.00071 8.52549 2.00071 9.28993 2.57404L13.1233 5.44904C13.6647 5.85508 13.9833 6.49232 13.9833 7.16904V11.8333C13.9833 13.0207 13.0207 13.9833 11.8333 13.9833H8.00509C8.00337 13.9833 8.00166 13.9833 7.99993 13.9833C7.99821 13.9833 7.9965 13.9833 7.99478 13.9833Z"
    />
  </svg>
);

export const ChevronRightIcon = () => (
  <svg
    className="stroke-current"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.83333 12.6665L10 8.49984L5.83333 4.33317"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  variant?: "default" | "withIcon" | "dotted" | "chevron";
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  variant = "default",
}) => {
  const renderSeparator = () => {
    switch (variant) {
      case "withIcon":
      case "default":
        return <span> / </span>;
      case "dotted":
        return <span className="block w-1 h-1 bg-gray-400 rounded-full"></span>;
      case "chevron":
        return <ChevronRightIcon />;
      default:
        return null;
    }
  };

  return (
    <nav>
      <ol
        className={`flex flex-wrap items-center ${
          variant === "dotted" ? "gap-2" : "gap-1.5"
        }`}
      >
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-gray-500 dark:text-gray-400">
                {renderSeparator()}
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
              >
                {index === 0 && variant === "withIcon" && <HomeIcon />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-sm text-gray-800 dark:text-white/90">
                {index === 0 && variant === "withIcon" && <HomeIcon />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
