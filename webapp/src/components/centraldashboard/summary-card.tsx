import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn, formatTrend, getTrendColor, getTrendIcon } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  trend: number;
  iconBgColor: string;
  iconColor: string;
  delay?: number;
}

export function SummaryCard({ 
  title, 
  value, 
  icon, 
  trend, 
  iconBgColor, 
  iconColor,
  delay = 0 
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <motion.p 
                className="text-2xl font-bold text-gray-900 mt-1"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
              >
                {value.toLocaleString()}
              </motion.p>
            </div>
            <div className={cn("p-3 rounded-lg", iconBgColor)}>
              <i className={cn(icon, iconColor, "text-xl")}></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={cn("inline-flex items-center text-sm", getTrendColor(trend))}>
              <i className={cn(getTrendIcon(trend), "mr-1")}></i>
              {formatTrend(trend)}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
