"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { maintenancePeriodsService } from "@/lib/services/maintenance-periods-service";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  // States for maintenance data and calculations
  const [totalMaintenanceDays, setTotalMaintenanceDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Constants for calculations
  const ANNUAL_HOURS = 365 * 24; // 8760 hours
  const MW_PER_HOUR = 330;
  const TOTAL_ANNUAL_MW = ANNUAL_HOURS * MW_PER_HOUR; // 2,890,800 MW

  // Fetch maintenance periods data
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        const response = await maintenancePeriodsService.getMaintenancePeriods();
        
        if (response.success && response.data) {
          // Calculate total days from all maintenance periods
          const totalDays = response.data.reduce((sum, period) => {
            return sum + period.durationDays;
          }, 0);
          
          setTotalMaintenanceDays(totalDays);
          console.log('Total maintenance days:', totalDays);
        } else {
          setError('Failed to fetch maintenance data');
        }
      } catch (err) {
        console.error('Error fetching maintenance data:', err);
        setError('Error loading maintenance data');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceData();
  }, []);

  // Only perform calculations when we have maintenance data (prevent 1496.9 GW from showing)
  let lostMW = 0;
  let adjustedTargetMW = 0;
  let daysPassed = 0;
  let maintenanceDaysPassed = 0;
  let productiveDays = 0;
  let actualMW = 0;
  
  if (!loading && totalMaintenanceDays >= 0) {
    // Calculations with proper maintenance data
    lostMW = totalMaintenanceDays * 24 * MW_PER_HOUR; // Total lost MW for full year maintenance
    adjustedTargetMW = TOTAL_ANNUAL_MW - lostMW; // Target after accounting for losses
    
    // Calculate actual production based on days passed and maintenance days passed
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    daysPassed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate maintenance days that have already passed this year
    maintenanceDaysPassed = totalMaintenanceDays > 0 ? 
      Math.floor((totalMaintenanceDays * daysPassed) / 365) : 0;
    
    // Actual production = (days passed - maintenance days passed) * 24 * 330
    productiveDays = daysPassed - maintenanceDaysPassed;
    actualMW = Math.max(0, productiveDays * 24 * MW_PER_HOUR);
  }
  
  // Debug logging
  console.log('Debug MonthlyTarget:', {
    loading,
    daysPassed,
    totalMaintenanceDays,
    maintenanceDaysPassed,
    productiveDays,
    actualMW,
    actualGW: actualMW / 1000
  });
  
  const achievementPercentage = adjustedTargetMW > 0 ? 
    ((actualMW / adjustedTargetMW) * 100).toFixed(2) : "0.00";
  const dailyTargetMW = adjustedTargetMW > 0 ? Math.floor(adjustedTargetMW / 365) : 0;
  const dailyActualMW = productiveDays > 0 ? Math.floor(actualMW / productiveDays) : 0;

  // Convert to GW for display (1 GW = 1000 MW)
  const actualGW = actualMW / 1000;
  const adjustedTargetGW = adjustedTargetMW / 1000;
  const lostGW = lostMW / 1000;

  // Ensure we have the correct actual GW for the chart (must be calculated outside ApexCharts options)
  const chartDisplayValue = actualGW.toFixed(1) + " GW";

  // Helper function to format MW/GW values
  const formatPowerValue = (mw: number) => {
    if (mw >= 1000) {
      return `${(mw / 1000).toFixed(1)} GW`;
    }
    return `${mw.toFixed(0)} MW`;
  };

  const series = [parseFloat(achievementPercentage)]; // Show percentage of objective achieved
  
  // Show achievement percentage (how much we produced vs objective)
  const achievementBadgeText = `${achievementPercentage}%`;
  const achievementValue = parseFloat(achievementPercentage);

  const options: ApexOptions = {
    colors: ["#00a0df"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 380,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "32px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return chartDisplayValue;
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        gradientToColors: ["#012a4a"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Show loading spinner until maintenance data is loaded
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-12 dark:bg-gray-900 sm:px-6 sm:pt-6">
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Objectif Annuel
              </h3>
              <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
                Objectif fixé pour chaque année
              </p>
            </div>
          </div>
          
          {/* Loading Spinner */}
          <div className="flex items-center justify-center h-[380px]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chargement des données de maintenance...
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading state for bottom metrics */}
        <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2 dark:bg-gray-700"></div>
            <div className="h-6 bg-gray-200 rounded w-20 dark:bg-gray-700"></div>
          </div>
          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 dark:bg-gray-700"></div>
            <div className="h-6 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
          </div>
          <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2 dark:bg-gray-700"></div>
            <div className="h-6 bg-gray-200 rounded w-18 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-12 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Objectif Annuel
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Objectif fixé pour chaque année
            </p>
          </div>
          <div className="relative h-fit">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-10">
                <div className="p-2">
                  <button
                    onClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 px-3 py-2"
                  >
                    Voir Plus
                  </button>
                  <button
                    onClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 px-3 py-2"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="max-h-[380px]" id="chartDarkStyle">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={380}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500">
            {achievementBadgeText}
          </span>
        </div>
        <p className="mx-auto mt-8 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {loading ? (
            "Chargement des données..."
          ) : error ? (
            "Erreur lors du chargement des données"
          ) : (
            `Production: ${actualGW.toFixed(1)} GW sur ${adjustedTargetGW.toFixed(1)} GW objectif (${achievementPercentage}%). Jour ${daysPassed}/365 - ${productiveDays} jours productifs.`
          )}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-xs dark:text-gray-400 sm:text-sm">
            Objectif
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {loading ? "..." : formatPowerValue(adjustedTargetMW)}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                fill="#D92D20"
              />
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-xs dark:text-gray-400 sm:text-sm">
            Pertes Prévues
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {loading ? "..." : formatPowerValue(lostMW)}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-xs dark:text-gray-400 sm:text-sm">
            Quotidien
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {loading ? "..." : formatPowerValue(dailyActualMW)}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
} 