import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AvailabilityData } from "@shared/schema";

interface AvailabilityOverviewProps {
  data: AvailabilityData;
}

export function AvailabilityOverview({ data }: AvailabilityOverviewProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (data.percentage / 100) * circumference;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">System Availability</h2>
            <p className="text-sm text-gray-600">7-day average performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-green-600">Operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#E5E7EB" 
                      strokeWidth="8" 
                      fill="none"
                    />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#10B981" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference}
                      strokeLinecap="round"
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div 
                        className="text-2xl font-bold text-gray-900"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      >
                        {data.percentage}%
                      </motion.div>
                      <div className="text-xs text-gray-500">Uptime</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Average availability over the last 7 days</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              className="bg-green-50 rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium text-green-800">Service Health</p>
                  <p className="text-xs text-green-600">All systems operational</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-blue-50 rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center">
                <i className="fas fa-clock text-blue-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium text-blue-800">Response Time</p>
                  <p className="text-xs text-blue-600">{data.responseTime} average</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-yellow-50 rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-yellow-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Maintenance</p>
                  <p className="text-xs text-yellow-600">Next: Sunday 2:00 AM</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
