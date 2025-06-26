export interface PerformanceDataPoint {
  timestamp: string;
  value: number;
}

export interface DashboardData {
  summary: {
    dataCenters: number;
    clusters: number;
    hosts: number;
    storageDomains: number;
    virtualMachines: number;
  };
  availability: {
    percentage: number;
    totalDowntimeHours: number;
    monitoredVMs: number;
    responseTime?: string;
  };
  performance: {
    cpu: PerformanceDataPoint[];
    memory: PerformanceDataPoint[];
    disk: PerformanceDataPoint[];
  };
  usage: {
    cpu: {
      percentage: number;
      peak: number;
      trend: number;
    };
    memory: {
      percentage: number;
      available: string;
      total: string;
      trend: number;
    };
    storage: {
      percentage: number;
      used: string;
      capacity: string;
      trend: number;
    };
  };
  alerts: any[]; // or your own Alert type
}
