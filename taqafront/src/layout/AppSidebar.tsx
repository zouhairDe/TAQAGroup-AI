"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  ListIcon,
  UserCircleIcon,
  ChevronDownIcon,
  TaskIcon,
  PlugInIcon,
  ChatIcon,
  MailIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Tableau de bord",
    path: "/dashboard",
  },
  {
    icon: <ListIcon />,
    name: "Anomalies",
    subItems: [
      { name: "Toutes les anomalies", path: "/anomalies" },
      { name: "Nouvelle anomalie", path: "/anomalies/new" },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "REX", 
    subItems: [
      { name: "Retours d'expérience", path: "/rex" },
      { name: "Nouveau REX", path: "/rex/new" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Équipes",
    path: "/teams",
  },
  {
    icon: <GridIcon />,
    name: "Planification",
    path: "/planning",
  },
  {
    icon: <GridIcon />,
    name: "Analytics",
    path: "/analytics",
  },
];

const supportItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Maintenance",
    path: "/maintenance",
  },
  {
    icon: <UserCircleIcon />,
    name: "Paramètres",
    path: "/settings",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support";
    index: number;
  } | null>(null);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "support"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                } flex-shrink-0`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered) && (
                <span className="transition-opacity duration-300 text-left">
                  {nav.name}
                </span>
              )}
              {(isExpanded || isHovered) && (
                <ChevronDownIcon
                  className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            <Link
              href={nav.path || "#"}
              className={`menu-item group ${
                pathname === nav.path
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  pathname === nav.path
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                } flex-shrink-0`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered) && (
                <span className="transition-opacity duration-300">
                  {nav.name}
                </span>
              )}
            </Link>
          )}
          {nav.subItems &&
            openSubmenu?.type === menuType &&
            openSubmenu?.index === index && (
              <ul className="mt-2 ml-6 space-y-2">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pathname === subItem.path
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      <span className="w-2 h-2 bg-current rounded-full opacity-50"></span>
                      {subItem.name}
                      {subItem.new && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </li>
      ))}
    </ul>
  );

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "support"
  ) => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev?.index === index
        ? null
        : { type: menuType, index }
    );
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-99999 flex h-screen flex-col overflow-y-hidden border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isExpanded || isHovered ? "lg:w-[290px]" : "lg:w-[90px]"
        } lg:translate-x-0`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/dashboard">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              {(isExpanded || isHovered) && (
                <div className="transition-opacity duration-300">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    TAQA
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Anomalies
                  </p>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            {/* Main Navigation */}
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-400 dark:text-gray-500">
                NAVIGATION
              </h3>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Support Section */}
            <div className="mt-8">
              <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-400 dark:text-gray-500">
                SYSTÈME
              </h3>
              {renderMenuItems(supportItems, "support")}
            </div>
          </nav>
        </div>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">MB</span>
            </div>
            {(isExpanded || isHovered) && (
              <div className="transition-opacity duration-300">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Mohamed Benali
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manager Production
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar; 