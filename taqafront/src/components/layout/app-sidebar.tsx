"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useSession } from "@/context/AuthProvider";
import {
  LayoutDashboard,
  AlertTriangle,
  Wrench,
  Calendar,
  FileText,
  ChevronDown,
  MoreHorizontal,
  Brain,
  LogOut,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Tableau de Bord",
    path: "/dashboard",
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    name: "Anomalies",
    path: "/anomalies",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    name: "Planification",
    path: "/maintenance",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    name: "Gestion des Arrêts",
    path: "/maintenance/periods",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    name: "Modèle IA",
    path: "/ai-model",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "REX",
    path: "/rex"
  },
];

const supportItems: NavItem[] = [
  // Removed Équipes and Paramètres as requested
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { signOut } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "support"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : supportItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "support",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "support"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-full transition-all duration-300 ease-in-out z-1000 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}>
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
                <Image
                className="dark:hidden"
                  src="/logo_2.svg"
                  alt="TAQA Morocco"
                width={150}
                height={40}
                  priority
              />
              <Image
                className="hidden dark:block"
                src="/logo.svg"
                alt="TAQA Morocco"
                width={150}
                height={40}
                  priority
              />
            </>
          ) : (
              <>
                <Image
                  className="dark:hidden"
                  src="/logo_2.svg"
                  alt="TAQA Morocco"
                  width={32}
                  height={32}
                  priority
                />
            <Image
                  className="hidden dark:block"
              src="/logo.svg"
              alt="TAQA Morocco"
              width={32}
                  height={32}
                  priority
            />
              </>
          )}
        </Link>
      </div>

        {/* Main Navigation */}
        <div className="flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {renderMenuItems(navItems, "main")}
            </div>
              {supportItems.length > 0 && (
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Gestion"
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </h2>
              {renderMenuItems(supportItems, "support")}
          </div>
              )}
          </div>
        </nav>
        </div>

        {/* User Info and Logout */}
        <div className="mt-auto">
          {/* User Info */}
          {/* {(isExpanded || isHovered || isMobileOpen) && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-semibold">
                  MB
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Mohamed Benali
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Chef d&apos;Équipe
                </p>
                </div>
              </div>
            </div>
          )} */}
          
          {/* Logout Button */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            {isExpanded || isHovered || isMobileOpen ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
              >
                <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                <span className="group-hover:text-red-500 transition-colors">Se déconnecter</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center py-3 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar; 