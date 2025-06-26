import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn, formatTrend, getTrendColor, getTrendIcon } from "@/lib/utils";

interface UsageCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  trend: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  progressColor: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export function UsageCard({ 
  title, 
  subtitle, 
  percentage, 
  trend, 
  icon, 
  iconBgColor, 
  iconColor,
  progressColor,
  stats 
}: UsageCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={cn("p-2 rounded-lg mr-3", iconBgColor)}>
              <i className={cn(icon, iconColor)}></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <motion.div 
              className="text-2xl font-bold text-gray-900"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {percentage}%
            </motion.div>
            <div className="flex items-center justify-end mt-1">
              <span className={cn("inline-flex items-center text-sm", getTrendColor(trend))}>
                <i className={cn(getTrendIcon(trend), "mr-1")}></i>
                {formatTrend(trend)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <Progress 
            value={percentage} 
            className="h-2" 
            style={{
              '--progress-background': progressColor
            } as React.CSSProperties}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-gray-600">{stat.label}</p>
              <p className="font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
