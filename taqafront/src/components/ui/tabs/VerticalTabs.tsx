"use client";
import { useState } from "react";

const VerticalTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Sidebar Navigation */}
        <div className="overflow-x-auto pb-2 sm:w-[200px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
          <nav className="flex flex-row w-full sm:flex-col sm:space-y-2">
            <button
              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${
                activeTab === "overview"
                  ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50"
                  : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`inline-flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${
                activeTab === "notification"
                  ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50"
                  : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("notification")}
            >
              Notification
            </button>
            <button
              className={`inline-flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${
                activeTab === "analytics"
                  ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50"
                  : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
            <button
              className={`inline-flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out sm:p-3 ${
                activeTab === "customers"
                  ? "text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50"
                  : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("customers")}
            >
              Customers
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "overview" && (
            <div>
              <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
                Overview
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overview ipsum dolor sit amet consectetur. Non vitae facilisis
                urna tortor placerat egestas donec. Faucibus diam gravida enim
                elit lacus a. Tincidunt fermentum condimentum quis et a et
                tempus. Tristique urna nisi nulla elit sit libero scelerisque
                ante.
              </p>
            </div>
          )}
          {activeTab === "notification" && (
            <div>
              <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
                Notification
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notification ipsum dolor sit amet consectetur. Non vitae
                facilisis urna tortor placerat egestas donec. Faucibus diam
                gravida enim elit lacus a. Tincidunt fermentum condimentum quis
                et a et tempus. Tristique urna nisi nulla elit sit libero
                scelerisque ante.
              </p>
            </div>
          )}
          {activeTab === "analytics" && (
            <div>
              <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
                Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analytics ipsum dolor sit amet consectetur. Non vitae facilisis
                urna tortor placerat egestas donec. Faucibus diam gravida enim
                elit lacus a. Tincidunt fermentum condimentum quis et a et
                tempus. Tristique urna nisi nulla elit sit libero scelerisque
                ante.
              </p>
            </div>
          )}
          {activeTab === "customers" && (
            <div>
              <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
                Customers
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customers ipsum dolor sit amet consectetur. Non vitae facilisis
                urna tortor placerat egestas donec. Faucibus diam gravida enim
                elit lacus a. Tincidunt fermentum condimentum quis et a et
                tempus. Tristique urna nisi nulla elit sit libero scelerisque
                ante.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerticalTabs;
