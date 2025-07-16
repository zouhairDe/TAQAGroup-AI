import React from "react";

export default function HorizontalList() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:w-fit">
      <ul className="flex flex-col md:flex-row">
        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-0 dark:border-gray-800 dark:text-gray-400 md:border-b-0 md:border-r">
          <span className="text-brand-500 dark:text-brand-400">
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
                d="M2.61719 7.99985C2.61719 5.02736 5.02687 2.61768 7.99936 2.61768C10.9719 2.61768 13.3815 5.02736 13.3815 7.99985C13.3815 10.9723 10.9719 13.382 7.99936 13.382C5.02687 13.382 2.61719 10.9723 2.61719 7.99985ZM7.99936 1.11768C4.19844 1.11768 1.11719 4.19893 1.11719 7.99985C1.11719 11.8008 4.19844 14.882 7.99936 14.882C11.8003 14.882 14.8815 11.8008 14.8815 7.99985C14.8815 4.19893 11.8003 1.11768 7.99936 1.11768ZM10.5185 7.26551C10.8114 6.97262 10.8114 6.49775 10.5185 6.20485C10.2256 5.91196 9.75075 5.91196 9.45785 6.20485L7.45885 8.20386L6.54089 7.28589C6.24799 6.993 5.77312 6.993 5.48023 7.28589C5.18733 7.57878 5.18733 8.05366 5.48023 8.34655L6.92852 9.79485C7.06917 9.9355 7.25994 10.0145 7.45885 10.0145C7.65776 10.0145 7.84853 9.9355 7.98918 9.79485L10.5185 7.26551Z"
                fill=""
              />
            </svg>
          </span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-0 dark:border-gray-800 dark:text-gray-400 md:border-b-0 md:border-r">
          <span className="text-brand-500 dark:text-brand-400">
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
                d="M2.61719 7.99985C2.61719 5.02736 5.02687 2.61768 7.99936 2.61768C10.9719 2.61768 13.3815 5.02736 13.3815 7.99985C13.3815 10.9723 10.9719 13.382 7.99936 13.382C5.02687 13.382 2.61719 10.9723 2.61719 7.99985ZM7.99936 1.11768C4.19844 1.11768 1.11719 4.19893 1.11719 7.99985C1.11719 11.8008 4.19844 14.882 7.99936 14.882C11.8003 14.882 14.8815 11.8008 14.8815 7.99985C14.8815 4.19893 11.8003 1.11768 7.99936 1.11768ZM10.5185 7.26551C10.8114 6.97262 10.8114 6.49775 10.5185 6.20485C10.2256 5.91196 9.75075 5.91196 9.45785 6.20485L7.45885 8.20386L6.54089 7.28589C6.24799 6.993 5.77312 6.993 5.48023 7.28589C5.18733 7.57878 5.18733 8.05366 5.48023 8.34655L6.92852 9.79485C7.06917 9.9355 7.25994 10.0145 7.45885 10.0145C7.65776 10.0145 7.84853 9.9355 7.98918 9.79485L10.5185 7.26551Z"
                fill=""
              />
            </svg>
          </span>

          <span> It is a long established </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-0 dark:border-gray-800 dark:text-gray-400 md:border-b-0 md:border-r">
          <span className="text-brand-500 dark:text-brand-400">
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
                d="M2.61719 7.99985C2.61719 5.02736 5.02687 2.61768 7.99936 2.61768C10.9719 2.61768 13.3815 5.02736 13.3815 7.99985C13.3815 10.9723 10.9719 13.382 7.99936 13.382C5.02687 13.382 2.61719 10.9723 2.61719 7.99985ZM7.99936 1.11768C4.19844 1.11768 1.11719 4.19893 1.11719 7.99985C1.11719 11.8008 4.19844 14.882 7.99936 14.882C11.8003 14.882 14.8815 11.8008 14.8815 7.99985C14.8815 4.19893 11.8003 1.11768 7.99936 1.11768ZM10.5185 7.26551C10.8114 6.97262 10.8114 6.49775 10.5185 6.20485C10.2256 5.91196 9.75075 5.91196 9.45785 6.20485L7.45885 8.20386L6.54089 7.28589C6.24799 6.993 5.77312 6.993 5.48023 7.28589C5.18733 7.57878 5.18733 8.05366 5.48023 8.34655L6.92852 9.79485C7.06917 9.9355 7.25994 10.0145 7.45885 10.0145C7.65776 10.0145 7.84853 9.9355 7.98918 9.79485L10.5185 7.26551Z"
                fill=""
              />
            </svg>
          </span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-0 dark:border-gray-800 dark:text-gray-400 md:border-b-0 md:border-r">
          <span className="text-brand-500 dark:text-brand-400">
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
                d="M2.61719 7.99985C2.61719 5.02736 5.02687 2.61768 7.99936 2.61768C10.9719 2.61768 13.3815 5.02736 13.3815 7.99985C13.3815 10.9723 10.9719 13.382 7.99936 13.382C5.02687 13.382 2.61719 10.9723 2.61719 7.99985ZM7.99936 1.11768C4.19844 1.11768 1.11719 4.19893 1.11719 7.99985C1.11719 11.8008 4.19844 14.882 7.99936 14.882C11.8003 14.882 14.8815 11.8008 14.8815 7.99985C14.8815 4.19893 11.8003 1.11768 7.99936 1.11768ZM10.5185 7.26551C10.8114 6.97262 10.8114 6.49775 10.5185 6.20485C10.2256 5.91196 9.75075 5.91196 9.45785 6.20485L7.45885 8.20386L6.54089 7.28589C6.24799 6.993 5.77312 6.993 5.48023 7.28589C5.18733 7.57878 5.18733 8.05366 5.48023 8.34655L6.92852 9.79485C7.06917 9.9355 7.25994 10.0145 7.45885 10.0145C7.65776 10.0145 7.84853 9.9355 7.98918 9.79485L10.5185 7.26551Z"
                fill=""
              />
            </svg>
          </span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>

        <li className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-0 dark:border-gray-800 dark:text-gray-400 md:border-b-0 md:border-r">
          <span className="text-brand-500 dark:text-brand-400">
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
                d="M2.61719 7.99985C2.61719 5.02736 5.02687 2.61768 7.99936 2.61768C10.9719 2.61768 13.3815 5.02736 13.3815 7.99985C13.3815 10.9723 10.9719 13.382 7.99936 13.382C5.02687 13.382 2.61719 10.9723 2.61719 7.99985ZM7.99936 1.11768C4.19844 1.11768 1.11719 4.19893 1.11719 7.99985C1.11719 11.8008 4.19844 14.882 7.99936 14.882C11.8003 14.882 14.8815 11.8008 14.8815 7.99985C14.8815 4.19893 11.8003 1.11768 7.99936 1.11768ZM10.5185 7.26551C10.8114 6.97262 10.8114 6.49775 10.5185 6.20485C10.2256 5.91196 9.75075 5.91196 9.45785 6.20485L7.45885 8.20386L6.54089 7.28589C6.24799 6.993 5.77312 6.993 5.48023 7.28589C5.18733 7.57878 5.18733 8.05366 5.48023 8.34655L6.92852 9.79485C7.06917 9.9355 7.25994 10.0145 7.45885 10.0145C7.65776 10.0145 7.84853 9.9355 7.98918 9.79485L10.5185 7.26551Z"
                fill=""
              />
            </svg>
          </span>

          <span> Lorem ipsum dolor sit amet </span>
        </li>
      </ul>
    </div>
  );
}
