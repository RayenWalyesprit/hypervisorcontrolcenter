// AvailabilityGauge.tsx
import { CircularProgress, Box, Typography } from "@mui/material";

export default function AvailabilityGauge({ value }: { value: number }) {
  const color =
    value > 95 ? "#22c55e" : value > 80 ? "#eab308" : "#ef4444";

  return (
    <Box className="bg-white p-4 rounded-lg shadow border text-center">
      <Typography variant="h6" className="text-gray-700 mb-2">
        Availability
      </Typography>
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={value}
          size={150}
          thickness={5}
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
          <Typography variant="h5" component="div" color="textPrimary">
            {value.toFixed(2)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
