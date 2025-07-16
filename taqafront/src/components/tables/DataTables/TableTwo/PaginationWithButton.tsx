"use client";

import { useState } from "react";

interface PaginationProps {
  totalPages: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export default function PaginationWithButton({
  totalPages,
  initialPage = 1,
  onPageChange,
}: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const renderPageNumbers = () => {
    const pagesToShow = 5; // Show 5 pages at a time
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(<li key={i}>{renderPageButton(i)}</li>);
    }

    if (startPage > 1) {
      pages.unshift(<li key="ellipsis-start">{renderEllipsis()}</li>);
    }
    if (endPage < totalPages) {
      pages.push(<li key="ellipsis-end">{renderEllipsis()}</li>);
    }

    return pages;
  };

  const renderPageButton = (page: number) => {
    return (
      <button
        onClick={() => handlePageChange(page)}
        className={`px-4 py-2 rounded ${
          currentPage === page
            ? "bg-brand-500 text-white"
            : "text-gray-700 dark:text-gray-400"
        } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
      >
        {page}
      </button>
    );
  };

  const renderEllipsis = () => {
    return (
      <span className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-400">
        ...
      </span>
    );
  };

  return (
    <div className="flex items-center justify-center gap-4 xl:justify-start">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <ul className="flex items-center gap-1">{renderPageNumbers()}</ul>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
