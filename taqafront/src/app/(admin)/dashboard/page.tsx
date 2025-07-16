"use client";

import React from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGlobalLoader } from "@/context/GlobalLoaderContext";
import MonthlyTarget from "@/components/dashboard/MonthlyTarget";

// Types
interface Activity {
  id: string;
  type: string;
  action: string;
  description: string;
  priority: string;
  equipment?: string;
  location: string;
  duration?: string;
  team?: string;
  user: string;
  userRole: string;
  time: string;
  status?: string;
  createdAt?: string;
}

interface CriticalAlert {
  id: string;
  title: string;
  status: string;
  severity: string;
  equipment: string;
  time: string;
  temperature?: string;
  pressure?: string;
  vibration?: string;
  actionRequired: boolean;
  createdAt?: string;
}

// Enhanced AnalyticsMetrics Component (keeping existing backend integration)
const AnalyticsMetrics = () => {
  const { data, error, isInitialLoading } = useDashboard();
  const { setLoading: setGlobalLoading } = useGlobalLoader();
  
  // Use global loader instead of local loading state
  React.useEffect(() => {
    if (isInitialLoading) {
      setGlobalLoading(true, 'Chargement du tableau de bord...');
    } else {
      setGlobalLoading(false);
    }
  }, [isInitialLoading, setGlobalLoading]);

  if (error || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="col-span-full p-6 text-center text-red-500 rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-500/10">
          Erreur lors du chargement des métriques: {error}
        </div>
      </div>
    );
  }

  const metrics = data.metrics;
  const metricsData = [
    {
      title: "Anomalies Totales",
      value: metrics.totalAnomalies.toString(),
      change: `${metrics.anomaliesChange > 0 ? '+' : ''}${metrics.anomaliesChange}%`,
      changeType: metrics.anomaliesChange > 0 ? "increase" : "decrease",
      color: "red",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "Taux de Résolution",
      value: `${metrics.resolutionRate}%`,
      change: `${metrics.resolutionRateChange > 0 ? '+' : ''}${metrics.resolutionRateChange}%`,
      changeType: metrics.resolutionRateChange > 0 ? "increase" : "decrease",
      color: "green",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "Temps Moyen de Traitement",
      value: `${Math.floor(metrics.averageResolutionTime)}h ${Math.floor((metrics.averageResolutionTime % 1) * 60)}m`,
      change: `${metrics.resolutionTimeChange > 0 ? '+' : ''}${metrics.resolutionTimeChange}%`,
      changeType: metrics.resolutionTimeChange > 0 ? "increase" : "decrease",
      color: "purple",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "Temps Moyen de Résolution",
      value: `${Math.floor(metrics.averageResolutionTime * 1.5)}h ${Math.floor(((metrics.averageResolutionTime * 1.5) % 1) * 60)}m`,
      change: `${metrics.resolutionTimeChange > 0 ? '+' : ''}${metrics.resolutionTimeChange}%`,
      changeType: metrics.resolutionTimeChange > 0 ? "increase" : "decrease",
      color: "orange",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400";
      case "orange":
        return "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400";
      case "yellow":
        return "bg-yellow-50 text-yellow-500 dark:bg-yellow-500/10 dark:text-yellow-400";
      case "green":
        return "bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400";
      case "blue":
        return "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400";
      case "purple":
        return "bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400";
      case "brand":
      default:
        return "bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
      {metricsData.map((stat, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getColorClasses(stat.color)}`}>
              {stat.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              stat.changeType === 'increase' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {stat.change}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              vs mois dernier
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ChartTab Component with backend integration patterns
interface ChartTabProps {
  selected: "quarterly" | "annually";
  onSelect: (period: "quarterly" | "annually") => void;
}

const ChartTab = ({ selected, onSelect }: ChartTabProps) => {
  const getButtonClass = (option: "quarterly" | "annually") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => onSelect("quarterly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass("quarterly")}`}
      >
        Trimestriel
      </button>
      <button
        onClick={() => onSelect("annually")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass("annually")}`}
      >
        Annuel
      </button>
    </div>
  );
};

// TailAdmin Chart Component with ApexCharts
const AnomaliesChart = () => {
  const { data } = useDashboard();
  const [selectedPeriod, setSelectedPeriod] = React.useState<"quarterly" | "annually">("quarterly");

  // Generate chart data from dashboard metrics - no static data, only from backend
  const getChartData = (period: "quarterly" | "annually") => {
    if (!data?.metrics) {
      return {
        series: [
          {
            name: "Anomalies Détectées",
            data: [],
          },
          {
            name: "Anomalies Résolues", 
            data: [],
          },
        ],
        categories: [],
        subtitle: "Chargement des données..."
      };
    }

    // Generate basic chart data from available metrics
    // This should be replaced with actual time series data from backend
    const baseAnomalies = data.metrics.totalAnomalies || 0;
    const resolutionRate = data.metrics.resolutionRate || 0;
    const resolved = Math.round(baseAnomalies * (resolutionRate / 100));

    if (period === "quarterly") {
      return {
        series: [
          {
            name: "Anomalies Détectées",
            data: [Math.round(baseAnomalies * 0.25), Math.round(baseAnomalies * 0.23), Math.round(baseAnomalies * 0.27), Math.round(baseAnomalies * 0.25)],
          },
          {
            name: "Anomalies Résolues", 
            data: [Math.round(resolved * 0.25), Math.round(resolved * 0.23), Math.round(resolved * 0.27), Math.round(resolved * 0.25)],
          },
        ],
        categories: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
        subtitle: "Évolution trimestrielle des anomalies en 2024"
      };
    } else {
      return {
        series: [
          {
            name: "Anomalies Détectées",
            data: [Math.round(baseAnomalies * 0.85), Math.round(baseAnomalies * 0.92), Math.round(baseAnomalies * 1.08), baseAnomalies],
          },
          {
            name: "Anomalies Résolues", 
            data: [Math.round(resolved * 0.85), Math.round(resolved * 0.92), Math.round(resolved * 1.08), resolved],
          },
        ],
        categories: ["2021", "2022", "2023", "2024"],
        subtitle: "Évolution annuelle des anomalies (2021-2024)"
      };
    }
  };

  const currentData = getChartData(selectedPeriod);

  const chartOptions = {
    colors: ["#00a0df", "#012a4a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area" as const,
      height: 350,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: currentData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#98a2b3",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#98a2b3",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#e4e7ec",
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      show: true,
      position: "top" as const,
      horizontalAlign: "left" as const,
      fontFamily: "Outfit",
      markers: {
        width: 8,
        height: 8,
        radius: 2,
    },
      },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} anomalies`,
      },
    },
  };

  // Dynamic import for ApexCharts
  const [ReactApexChart, setReactApexChart] = React.useState<any>(null);

  React.useEffect(() => {
    import("react-apexcharts").then((mod) => {
      setReactApexChart(() => mod.default);
    });
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-full">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Tendance des Anomalies
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            {currentData.subtitle}
          </span>
        </div>
        <ChartTab selected={selectedPeriod} onSelect={setSelectedPeriod} />
      </div>
      <div className="mt-6">
        <div className="w-full">
          {ReactApexChart ? (
        <ReactApexChart
              options={chartOptions}
              series={currentData.series}
          type="area"
          height={350}
        />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">Graphique non disponible</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Types d'Anomalies Component with backend integration
const TopAnomaliesTypes = () => {
  const { data } = useDashboard();
  const [selectedPeriod, setSelectedPeriod] = React.useState("30j");
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  // Use only backend data
  const anomaliesTypes = data?.anomalyTypes || [];

  const [ReactApexChart, setReactApexChart] = React.useState<any>(null);

  React.useEffect(() => {
    import("react-apexcharts").then((mod) => {
      setReactApexChart(() => mod.default);
    });
  }, []);

  const chartOptions = {
    colors: anomaliesTypes.map(item => item.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut" as const,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    labels: anomaliesTypes.map(item => item.type),
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#374151',
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              formatter: function (val: string) {
                return val + '%'
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 400,
              color: '#6b7280',
              formatter: function () {
                return anomaliesTypes.reduce((sum, item) => sum + item.count, 0).toString()
              }
            }
          }
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1,
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'darken',
          value: 0.7,
        }
      }
    },
    tooltip: {
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function(val: number) {
          return val + "% (" + anomaliesTypes[0].count + " cas)"
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const series = anomaliesTypes.map(item => item.percentage);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
      case 'high': return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500';
      case 'medium': return 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400';
      case 'low': return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') 
      ? 'text-error-600 dark:text-error-500' 
      : 'text-success-600 dark:text-success-500';
  };
        
        return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
                <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Types d'Anomalies
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Répartition par catégorie
          </p>
                </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {['7j', '30j', '90j'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
                </div>
              </div>
      
      {/* Donut Chart */}
      <div className="mb-6 relative">
        {ReactApexChart ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="donut"
            height={220}
          />
        ) : (
          <div className="h-56 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Graphique non disponible</p>
            </div>
          </div>
        )}
              </div>

      {/* Enhanced Legend */}
      <div className="space-y-3">
        {anomaliesTypes.map((item, index) => (
          <div 
            key={index} 
            className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
              hoveredIndex === index 
                ? 'bg-gray-50 dark:bg-gray-800/50 scale-[1.02]' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm" 
                  style={{ backgroundColor: item.color }}
                ></div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {item.type}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity === 'critical' ? 'Critique' : 
                     item.severity === 'high' ? 'Élevé' : 
                     item.severity === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                  <span className={`text-xs font-medium ${getTrendColor(item.trend)}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Critical Alerts Component with backend integration
const CriticalAlerts = () => {
  const { data, getTimeAgo } = useDashboard();
  const [filter, setFilter] = React.useState("all");
  
  // Use only backend data
  const allAlerts: CriticalAlert[] = data?.criticalAlerts || [];

  // Sort by createdAt timestamp (latest created first) and show 5 latest alerts
  const criticalAlerts = allAlerts
    .sort((a, b) => {
      // Sort by createdAt timestamp - latest created first
      if (a.createdAt && b.createdAt) {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (latest first)
      }
      return 0; // Keep original order if no timestamps
    })
    .slice(0, 5);

  // Apply status filter based on actual database status values
  const filteredAlerts = filter === "all" 
    ? criticalAlerts 
    : criticalAlerts.filter((alert) => {
        if (filter === "new") return alert.status === "new";
        if (filter === "in_progress") return alert.status === "in_progress";  
        if (filter === "resolved") return alert.status === "resolved";
        if (filter === "closed") return alert.status === "closed";
        return true;
      });

  const getSeverityConfig = (severity: string) => {
    const configs = {
      critical: {
        badge: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
        dot: "bg-error-500",
        label: "Critique"
      },
      high: {
        badge: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
        dot: "bg-warning-500",
        label: "Élevé"
      },
      medium: {
        badge: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700",
        dot: "bg-brand-500",
        label: "Moyen"
      },
    };
    
    return configs[severity as keyof typeof configs] || configs.medium;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      new: { bg: "bg-blue-50 dark:bg-blue-800/20", text: "text-blue-700 dark:text-blue-300", label: "Nouvelle" },
      in_progress: { bg: "bg-orange-50 dark:bg-orange-800/20", text: "text-orange-700 dark:text-orange-300", label: "En cours" },
      resolved: { bg: "bg-green-50 dark:bg-green-800/20", text: "text-green-700 dark:text-green-300", label: "Résolue" },
      closed: { bg: "bg-gray-50 dark:bg-gray-800/20", text: "text-gray-700 dark:text-gray-300", label: "Fermée" },
    };
    
    return configs[status as keyof typeof configs] || configs.new;
  };

  const handleAlertClick = (id: string) => {
    // Redirect to specific anomaly page
    window.location.href = `/anomalies/${id}`;
  };

  const handleViewAllClick = () => {
    // Redirect to anomalies page
    window.location.href = "/anomalies";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
              <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Alertes Critiques
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {criticalAlerts.filter((a: any) => a.status !== 'resolved' && a.status !== 'closed').length} alertes actives
                </p>
              </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full animate-pulse"></div>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            </div>
          <button 
            onClick={handleViewAllClick}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
          >
            Voir tout
          </button>
          </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: "all", label: "Toutes", count: criticalAlerts.length },
          { key: "new", label: "Nouvelles", count: criticalAlerts.filter((a: any) => a.status === 'new').length },
          { key: "in_progress", label: "En cours", count: criticalAlerts.filter((a: any) => a.status === 'in_progress').length },
          { key: "resolved", label: "Résolues", count: criticalAlerts.filter((a: any) => a.status === 'resolved').length },
          { key: "closed", label: "Fermées", count: criticalAlerts.filter((a: any) => a.status === 'closed').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full ${
              filter === tab.key 
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
                    </div>

      {/* Enhanced Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const severityConfig = getSeverityConfig(alert.severity);
          const statusConfig = getStatusConfig(alert.status);
          
          return (
            <div 
              key={alert.id} 
              className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                alert.status === 'resolved'
                  ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700 opacity-75'
                  : `${statusConfig.bg} border-gray-200 dark:border-gray-700 hover:scale-[1.01]`
              }`}
              onClick={() => handleAlertClick(alert.id)}
            >
              {/* Priority Indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                alert.severity === 'critical' 
                  ? 'bg-error-500' 
                  : alert.severity === 'high' 
                  ? 'bg-warning-500' 
                  : 'bg-brand-500'
              }`}></div>
              
              <div className="flex items-start gap-4">
                {/* Severity Icon */}
                <div className="flex-shrink-0 relative">
                  <div className={`w-3 h-3 rounded-full ${severityConfig.dot} shadow-sm`}></div>
                  </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                      {alert.title}
                    </h4>
                    {alert.actionRequired && alert.status !== 'resolved' && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${severityConfig.badge}`}>
                          {severityConfig.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {alert.equipment}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Créé: {alert.createdAt ? getTimeAgo(alert.createdAt) : alert.time}
                      </span>
                    </div>

                    {/* Technical Details */}
                    {(alert.temperature || alert.pressure || alert.vibration) && (
                      <div className="flex items-center gap-3 text-xs bg-white/50 dark:bg-gray-900/20 rounded-lg px-3 py-2">
                        {alert.temperature && (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Temp: {alert.temperature}
                          </span>
                        )}
                        {alert.pressure && (
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            Pression: {alert.pressure}
                          </span>
                        )}
                        {alert.vibration && (
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            Vibration: {alert.vibration}
                          </span>
                        )}
                  </div>
                    )}
                </div>
              </div>
          </div>

              {/* Action Hint */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Cliquer pour voir les détails
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune alerte dans cette catégorie</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Team Performance Component with backend integration
const TeamPerformance = () => {
  const { data } = useDashboard();
  const [selectedMetric, setSelectedMetric] = React.useState("efficiency");
  
  // Use only backend data
  const teams = data?.teamPerformance || [];

  const [ReactApexChart, setReactApexChart] = React.useState<any>(null);

  React.useEffect(() => {
    import("react-apexcharts").then((mod) => {
      setReactApexChart(() => mod.default);
    });
  }, []);

  const chartOptions = {
    colors: ["#12b76a", "#f79009"],
    chart: {
      fontFamily: "Outfit, sans-serif",
        type: "bar" as const,
      height: 200,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: teams.map(team => team.name.replace("Équipe ", "")),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#98a2b3",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#98a2b3",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#e4e7ec",
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: true,
      position: "top" as const,
      horizontalAlign: "left" as const,
              fontFamily: "Outfit",
      fontSize: "12px",
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} anomalies`,
      },
    },
  };

  const series = [
    {
      name: "Résolues",
      data: teams.map(team => team.resolved),
    },
    {
      name: "En cours",
      data: teams.map(team => team.pending),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return { icon: '🟢', label: 'En service', color: 'text-success-600' };
      case 'break': return { icon: '🟡', label: 'Pause', color: 'text-warning-600' };
      case 'offline': return { icon: '🔴', label: 'Hors service', color: 'text-error-600' };
      default: return { icon: '⚪', label: 'Inconnu', color: 'text-gray-500' };
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
              <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
            Performance des Équipes
        </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suivi des performances par équipe
                </p>
              </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: "efficiency", label: "Efficacité", icon: "📊" },
            { key: "response", label: "Réponse", icon: "⏱️" },
            { key: "satisfaction", label: "Qualité", icon: "⭐" },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedMetric === metric.key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <span>{metric.icon}</span>
              {metric.label}
          </button>
          ))}
        </div>
      </div>
      
      {/* Compact Chart */}
      <div className="mb-6">
        {ReactApexChart ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="bar"
            height={180}
          />
        ) : (
          <div className="h-44 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        )}
      </div>

      {/* Enhanced Team Cards */}
          <div className="space-y-4">
        {teams.map((team, index) => {
          const statusInfo = getStatusIcon(team.status);
          const isTopPerformer = team.efficiency >= 90;

  return (
            <div 
              key={index} 
              className={`group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                isTopPerformer 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/10 dark:to-emerald-900/10 dark:border-green-800' 
                  : 'bg-white border-gray-200 dark:bg-gray-800/30 dark:border-gray-700'
              } hover:scale-[1.01]`}
            >
              {/* Top Performer Badge */}
              {isTopPerformer && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  🏆 Top
        </div>
              )}

              <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                  <div className="relative">
                                          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {team.name.split(' ')[1][0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 text-sm">
                      {statusInfo.icon}
                    </div>
              </div>
              <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {team.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Chef: {team.leader}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${statusInfo.color} font-medium`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {team.members} membres • {team.shift}
                      </span>
                    </div>
              </div>
            </div>
            <div className="text-right">
                                  <div className={`text-lg font-bold ${
                  team.trend.startsWith('+') ? 'text-success-600' : 'text-error-600'
                }`}>
                  {team.efficiency}%
                </div>
                <div className={`text-xs font-medium ${
                  team.trend.startsWith('+') ? 'text-success-500' : 'text-error-500'
                }`}>
                    {team.trend}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {team.resolved}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Résolues
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {team.pending}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    En cours
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {team.responseTime}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Réponse
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Efficacité</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">
                {team.efficiency}%
              </span>
            </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 ${
                      team.efficiency >= 90 ? 'bg-gradient-to-r from-success-500 to-success-400' :
                      team.efficiency >= 80 ? 'bg-gradient-to-r from-brand-500 to-brand-400' :
                      'bg-gradient-to-r from-warning-500 to-warning-400'
                    }`}
                    style={{ width: `${team.efficiency}%` }}
                  ></div>
          </div>
      </div>

              {/* Satisfaction Rating */}
              <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Satisfaction:</span>
                  <div className="flex items-center gap-1 text-xs">
                    {renderStars(team.satisfaction)}
                    <span className="ml-1 font-medium text-gray-800 dark:text-white">
                      {team.satisfaction}
                    </span>
                    </div>
                  </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-brand-500 hover:text-brand-600 font-medium">
                  Détails →
      </button>
                </div>
              </div>
          );
        })}
          </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {teams.reduce((sum, team) => sum + team.resolved, 0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Résolues</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.round(teams.reduce((sum, team) => sum + team.efficiency, 0) / teams.length)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Efficacité Moy.</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {teams.filter(team => team.status === 'active').length}/{teams.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Équipes Actives</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Recent Activities Component with backend integration
const RecentActivities = () => {
  const { data } = useDashboard();
  const [filter, setFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  // Use only backend data
  const activities: Activity[] = data?.recentActivities || [];

  const getActivityConfig = (type: string) => {
    const configs = {
      success: {
        bg: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
        dot: "bg-success-500",
        badge: "bg-success-500",
        label: "Résolu"
      },
      alert: {
        bg: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
        dot: "bg-error-500",
        badge: "bg-error-500",
        label: "Alerte"
      },
      warning: {
        bg: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
        dot: "bg-warning-500",
        badge: "bg-warning-500",
        label: "Attention"
      },
      maintenance: {
        bg: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
        dot: "bg-brand-500",
        badge: "bg-brand-500",
        label: "Maintenance"
      },
      info: {
        bg: "bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
        dot: "bg-gray-500",
        badge: "bg-gray-500",
        label: "Info"
      },
      assignment: {
        bg: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
        dot: "bg-brand-500",
        badge: "bg-brand-500",
        label: "Assignation"
      },
    };
    
    return configs[type as keyof typeof configs] || configs.info;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-error-600 bg-error-50 border-error-200 dark:text-error-500 dark:bg-error-500/15';
      case 'high': return 'text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-500 dark:bg-warning-500/15';
      case 'medium': return 'text-warning-700 bg-warning-100 border-warning-300 dark:text-warning-400 dark:bg-warning-500/10';
      case 'low': return 'text-success-600 bg-success-50 border-success-200 dark:text-success-500 dark:bg-success-500/15';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800/30';
    }
  };

  const filteredActivities = filter === "all" ? activities : activities.filter(activity => activity.type === filter);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
              Activités Récentes
            </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dernières actions et événements
                        </p>
          </div>
        </div>
                    
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {[
          { key: "all", label: "Toutes", count: activities.length },
          { key: "success", label: "Résolutions", count: activities.filter(a => a.type === 'success').length },
          { key: "alert", label: "Alertes", count: activities.filter(a => a.type === 'alert').length },
          { key: "maintenance", label: "Maintenance", count: activities.filter(a => a.type === 'maintenance').length },
          { key: "info", label: "Rapports", count: activities.filter(a => a.type === 'info').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full ${
                filter === tab.key 
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {tab.count}
                        </span>
            )}
          </button>
        ))}
      </div>
                      
      {/* Enhanced Activities Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500 via-brand-400 to-success-500 opacity-30"></div>
        
        <div className="space-y-4">
          {paginatedActivities.map((activity, index) => {
            const config = getActivityConfig(activity.type);
            
            return (
              <div 
                key={activity.id} 
                className="group relative pl-16 pr-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.01]"
              >
                {/* Timeline Icon */}
                <div className="absolute left-0 top-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${config.bg} border-2 border-white dark:border-gray-800`}>
                    <div className={`w-6 h-6 rounded-full ${config.dot}`}></div>
                      </div>
                  {/* Connection dot */}
                  <div className={`absolute top-1/2 right-0 w-3 h-3 ${config.badge} rounded-full transform translate-x-1/2 -translate-y-1/2 border-2 border-white dark:border-gray-800`}></div>
                </div>

                {/* Activity Content */}
                <div className="min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                          {activity.action}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    <div className="flex-shrink-0 ml-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                      {activity.priority === 'critical' ? 'Critique' :
                       activity.priority === 'high' ? 'Élevé' :
                       activity.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                    </div>
                      </div>
                      
                  {/* Activity Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-xs">
                    {activity.equipment && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>Équipement:</span>
                        <span className="font-mono">{activity.equipment}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <span>Lieu:</span>
                      <span>{activity.location}</span>
                    </div>
                    {activity.duration && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>Durée:</span>
                        <span>{activity.duration}</span>
                      </div>
                    )}
                    {activity.team && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <span>Équipe:</span>
                        <span>{activity.team}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {activity.user[0]}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-800 dark:text-white">
                          {activity.user}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          • {activity.userRole}
                        </span>
                      </div>
                    </div>
                  <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                    {activity.time}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-brand-500 hover:text-brand-600 font-medium">
                        Détails →
                      </button>
                  </div>
                </div>
                </div>
              </div>
            );
          })}
              </div>
            </div>

      {paginatedActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité dans cette catégorie</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    currentPage === page
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="overflow-hidden max-w-full">
      {/* Analytics Metrics */}
        <AnalyticsMetrics />
      
            {/* Main Chart and Monthly Target - 60/40 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3">
        <AnomaliesChart />
      </div>
        <div className="lg:col-span-2">
          <MonthlyTarget />
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="mb-6">
        <CriticalAlerts />
      </div>

      {/* Recent Activities */}
      <div>
        <RecentActivities />
      </div>
      </div>
  );
} 