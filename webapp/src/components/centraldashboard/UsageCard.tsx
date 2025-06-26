// UsageCard.tsx
import { CircularProgress, Box, Typography } from "@mui/material";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface UsageCardProps {
  label: string;
  used: number;
  available: number;
  unit: string;
}

const mockChartData = [
  { value: 10 },
  { value: 30 },
  { value: 20 },
  { value: 50 },
  { value: 40 },
  { value: 60 },
  { value: 30 }
];

export default function UsageCard({ label, used, available, unit }: UsageCardProps) {
  const percent = Math.min((used / available) * 100, 100);
  const color = percent > 90 ? "#ef4444" : percent > 75 ? "#facc15" : "#22c55e";

return (
  <div className="bg-white p-4 rounded-lg shadow border flex flex-col items-center space-y-3 w-full">
    <Typography variant="subtitle1" className="text-gray-700 font-medium">
      {label}
    </Typography>
    <p className="text-sm text-gray-500 -mt-1">
      {available - used} Available of {available} {unit}
    </p>
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={percent}
        size={80}
        thickness={4}
        sx={{ color }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="body1" component="div" color="textPrimary">
          {used} {unit}
        </Typography>
      </Box>
    </Box>
    <div className="w-full h-14">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockChartData}>
          <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
          <Tooltip formatter={(v: any) => `${v}${unit}`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
}