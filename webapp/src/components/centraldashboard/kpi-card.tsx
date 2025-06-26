import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: number;
  delay?: number;
}

export function KPICard({ 
  title, 
  value, 
  subtitle,
  icon, 
  iconBgColor, 
  iconColor,
  trend,
  delay = 0 
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <motion.div 
                className="text-3xl font-bold text-gray-900 mb-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: delay + 0.2 }}
              >
                {typeof value === 'number' ? value.toLocaleString() : value}
              </motion.div>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", iconBgColor)}>
              <i className={cn(icon, iconColor, "text-2xl")}></i>
            </div>
          </div>
          
          {trend !== undefined && (
            <div className="mt-4 flex items-center">
              <span className={cn(
                "inline-flex items-center text-sm font-medium",
                trend >= 0 ? "text-green-600" : "text-red-600"
              )}>
                <i className={cn(
                  trend >= 0 ? "fas fa-arrow-up" : "fas fa-arrow-down",
                  "mr-1 text-xs"
                )}></i>
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}