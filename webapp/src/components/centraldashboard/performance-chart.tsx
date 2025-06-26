import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { PerformanceDataPoint } from "@/types/dashboard"; 

interface PerformanceChartProps {
  title: string;
  data: PerformanceDataPoint[];
  color: string; 
  unit: string;
  icon: string;
  delay?: number;
}

export function PerformanceChart({
  title,
  data,
  color,
  unit,
  icon,
  delay = 0,
}: PerformanceChartProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{formatTime(label)}</p>
          <p className="text-sm font-semibold text-gray-900">
            {`${payload[0].value} ${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg space-x-2">
            <i className={`${icon} text-gray-500`}></i>
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${color})`}
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-sm text-gray-500">No performance data available.</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
