import React from "react";
import Badge from "../ui/badge";

const mockData = [
  {
    id: 1,
    title: "Anomalies Détectées",
    value: "24.7K",
    change: "+20%",
    direction: "up",
    comparisonText: "Vs mois dernier",
  },
  {
    id: 2,
    title: "Interventions Totales", 
    value: "55.9K",
    change: "+4%",
    direction: "up",
    comparisonText: "Vs mois dernier",
  },
  {
    id: 3,
    title: "Taux de Résolution",
    value: "87%",
    change: "-1.59%",
    direction: "down",
    comparisonText: "Vs mois dernier",
  },
  {
    id: 4,
    title: "Temps Moyen Résolution",
    value: "2h 56m",
    change: "+7%",
    direction: "up", 
    comparisonText: "Vs mois dernier",
  },
];

const AnalyticsMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {/* <!-- Metric Item Start --> */}
      {mockData.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">
            {item.title}
          </p>
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {item.value}
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                color={
                  item.direction === "up"
                    ? "success"
                    : item.direction === "down"
                    ? "error"
                    : "warning"
                }
              >
                <span className="text-xs">{item.change}</span>
              </Badge>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.comparisonText}
              </span>
            </div>
          </div>
        </div>
      ))}
      {/* <!-- Metric Item End --> */}
    </div>
  );
};

export default AnalyticsMetrics; 