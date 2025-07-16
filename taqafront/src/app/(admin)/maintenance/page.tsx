import MaintenanceCalendar from "@/components/maintenance/maintenance-calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planification | TAQA Dashboard",
  description: "Gestion et planification des interventions de maintenance avec intégration des anomalies",
};

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <MaintenanceCalendar />
    </div>
  );
} 