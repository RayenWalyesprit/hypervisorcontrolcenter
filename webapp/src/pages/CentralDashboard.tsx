import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardData } from "@/types/dashboard";

import { KPICard } from "@/components/centraldashboard/kpi-card";
import { PerformanceChart } from "@/components/centraldashboard/performance-chart";
import { AvailabilityOverview } from "@/components/centraldashboard/availability-overview";
import { SummaryCard } from "@/components/centraldashboard/summary-card";
import { UsageCard } from "@/components/centraldashboard/usage-card";
import { TicketTabs } from "@/components/centraldashboard/ticket-tabs";
import React from "react";

export default function CentralDashboard() {
const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then(res => res.json())
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      });
  }, []);

  if (loading || !dashboardData) return <p className="p-6">Loading dashboard...</p>;


 return (
  <div className="space-y-8 p-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard 
        title="VMs Monitored" 
        value={dashboardData.availability.monitoredVMs} 
        icon="fas fa-desktop" 
        iconBgColor="bg-blue-100" 
        iconColor="text-blue-600"
      />
      <KPICard 
        title="Uptime" 
        value={`${dashboardData.availability.percentage}%`} 
        icon="fas fa-check-circle" 
        iconBgColor="bg-green-100" 
        iconColor="text-green-600"
      />
      <KPICard 
        title="Downtime" 
        value={`${dashboardData.availability.totalDowntimeHours} hrs`} 
        icon="fas fa-clock" 
        iconBgColor="bg-yellow-100" 
        iconColor="text-yellow-600"
      />
      <KPICard 
        title="Alerts" 
        value={dashboardData.alerts.length} 
        icon="fas fa-exclamation-triangle" 
        iconBgColor="bg-red-100" 
        iconColor="text-red-600"
      />
    </div>

    {/* Availability Gauge */}
    <AvailabilityOverview data={{
      percentage: dashboardData.availability.percentage,
      responseTime: `${dashboardData.availability.totalDowntimeHours} hrs`
    }} />

    {/* Summary Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <SummaryCard title="Data Centers" value={dashboardData.summary.dataCenters} trend={4} icon="fas fa-building" iconBgColor="bg-gray-100" iconColor="text-gray-700" />
      <SummaryCard title="Clusters" value={dashboardData.summary.clusters} trend={3} icon="fas fa-project-diagram" iconBgColor="bg-indigo-100" iconColor="text-indigo-600" />
      <SummaryCard title="Hosts" value={dashboardData.summary.hosts} trend={2} icon="fas fa-server" iconBgColor="bg-purple-100" iconColor="text-purple-600" />
      <SummaryCard title="Storage" value={dashboardData.summary.storageDomains} trend={5} icon="fas fa-hdd" iconBgColor="bg-pink-100" iconColor="text-pink-600" />
    </div>

    {/* Usage Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UsageCard
        title="CPU Usage"
        subtitle="7-day average"
        percentage={dashboardData.usage.cpu.percentage}
        trend={dashboardData.usage.cpu.trend}
        icon="fas fa-microchip"
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        progressColor="#3b82f6"
        stats={[{ label: "Peak", value: `${dashboardData.usage.cpu.peak}%` }]}
      />
      <UsageCard
        title="Memory Usage"
        subtitle="Available vs Total"
        percentage={dashboardData.usage.memory.percentage}
        trend={dashboardData.usage.memory.trend}
        icon="fas fa-memory"
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        progressColor="#10b981"
        stats={[
          { label: "Available", value: dashboardData.usage.memory.available },
          { label: "Total", value: dashboardData.usage.memory.total }
        ]}
      />
      <UsageCard
        title="Storage Usage"
        subtitle="Active Disk"
        percentage={dashboardData.usage.storage.percentage}
        trend={dashboardData.usage.storage.trend}
        icon="fas fa-database"
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
        progressColor="#facc15"
        stats={[
          { label: "Used", value: dashboardData.usage.storage.used },
          { label: "Capacity", value: dashboardData.usage.storage.capacity }
        ]}
      />
    </div>

    {/* Performance Charts */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PerformanceChart 
        title="CPU" 
        data={dashboardData.performance.cpu} 
        color="#3b82f6" 
        unit="%" 
        icon="fas fa-microchip"
      />
      <PerformanceChart 
        title="Memory" 
        data={dashboardData.performance.memory} 
        color="#10b981" 
        unit="GB" 
        icon="fas fa-memory"
      />
      <PerformanceChart 
        title="Disk" 
        data={dashboardData.performance.disk} 
        color="#facc15" 
        unit="%" 
        icon="fas fa-database"
      />
    </div>

    {/* Ticket & Alerts Tabs */}
    <TicketTabs  />
  </div>
)
}