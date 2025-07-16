"use client";
import React, { useState } from "react";

interface TabData {
  id: string;
  label: string;
  content: string;
  count?: number;
}

const tabData: TabData[] = [
  {
    id: "overview",
    label: "Overview",
    content:
      "Overview ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
    count: 8,
  },
  {
    id: "notification",
    label: "Notification",
    content:
      "Notification ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
  },
  {
    id: "analytics",
    label: "Analytics",
    content:
      "Analytics ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
    count: 4,
  },
  {
    id: "customers",
    label: "Customers",
    content:
      "Customers ipsum dolor sit amet consectetur. Non vitae facilisis urna tortor placerat egestas donec. Faucibus diam gravida enim elit lacus a. Tincidunt fermentum condimentum quis et a et tempus. Tristique urna nisi nulla elit sit libero scelerisque ante.",
    count: 12,
  },
];

const TabButton: React.FC<{
  tab: TabData;
  isActive: boolean;
  onClick: () => void;
}> = ({ tab, isActive, onClick }) => (
  <button
    className={`inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
      isActive
        ? "text-brand-500 dark:border-brand-400 border-brand-500 dark:text-brand-400"
        : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }`}
    onClick={onClick}
  >
    {tab.label}
    {tab.count !== undefined && (
      <span className="inline-block items-center justify-center rounded-full bg-brand-50 px-2 py-0.5 text-center text-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
        {tab.count}
      </span>
    )}
  </button>
);

const TabContent: React.FC<{ tab: TabData }> = ({ tab }) => (
  <div>
    <h3 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
      {tab.label}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">{tab.content}</p>
  </div>
);

const TabWithBadge: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-2 overflow-x-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
          {tabData.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>
      </div>

      <div className="pt-4 dark:border-gray-800">
        {tabData.map((tab) => (
          <div
            key={tab.id}
            style={{ display: activeTab === tab.id ? "block" : "none" }}
          >
            <TabContent tab={tab} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabWithBadge;
