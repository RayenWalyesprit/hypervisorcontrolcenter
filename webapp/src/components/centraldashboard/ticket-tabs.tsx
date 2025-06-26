import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, getSeverityColor, getSeverityDotColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Local Alert interface
interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  acknowledged: boolean;
  time: string;
  source: string;
}

export function TicketTabs() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTab, setSelectedTab] = useState("alerts");
  const [timeRange, setTimeRange] = useState("7d");
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then(res => res.json())
      .then((data) => setAlerts(data || []))
      .catch((err) => {
        console.error("Failed to fetch alerts", err);
        toast({ title: "Error", description: "Failed to load alerts", variant: "destructive" });
      });
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      setAckLoadingId(alertId);
      const res = await fetch(`http://localhost:5000/api/alerts/${alertId}/acknowledge`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to acknowledge");

      toast({
        title: "Alert Acknowledged",
        description: "The alert has been successfully acknowledged.",
      });

      // Optimistically update local state
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAckLoadingId(null);
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">System Alerts & Tickets</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Time Range:</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm">
                <i className="fas fa-filter mr-2"></i> Filter
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
              <TabsTrigger value="alerts" className="flex items-center px-1 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Active Alerts
                <Badge variant="secondary" className="bg-red-100 text-red-600 ml-2">{activeAlerts.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center px-1 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600">
                <i className="fas fa-chart-line mr-2"></i>
                Availability Reports
                <Badge variant="secondary" className="ml-2">7</Badge>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center px-1 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600">
                <i className="fas fa-tools mr-2"></i>
                Maintenance
                <Badge variant="secondary" className="ml-2">3</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="alerts" className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
                  <p>No active alerts</p>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="mt-2">
                          <div className={cn("w-2 h-2 rounded-full", getSeverityDotColor(alert.severity))}></div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                            <Badge className={cn("ml-2", getSeverityColor(alert.severity))}>{alert.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex text-xs text-gray-500 mt-2 gap-4">
                            <span><i className="fas fa-clock mr-1"></i>{alert.time}</span>
                            <span><i className="fas fa-server mr-1"></i>{alert.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={ackLoadingId === alert.id}
                        >
                          {ackLoadingId === alert.id ? "..." : "Acknowledge"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-external-link-alt"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="availability">
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-chart-line text-4xl mb-4"></i>
                <p>Availability reports will be displayed here</p>
              </div>
            </TabsContent>

            <TabsContent value="maintenance">
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-tools text-4xl mb-4"></i>
                <p>Maintenance schedules will be displayed here</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
