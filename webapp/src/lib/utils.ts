import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTrend(trend: number): string {
  const sign = trend >= 0 ? "+" : "";
  return `${sign}${trend.toFixed(1)}%`;
}

export function getTrendColor(trend: number): string {
  if (trend > 0) return "text-red-600";
  if (trend < 0) return "text-green-600";
  return "text-gray-600";
}

export function getTrendIcon(trend: number): string {
  if (trend > 0) return "fas fa-arrow-up";
  if (trend < 0) return "fas fa-arrow-down";
  return "fas fa-minus";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getSeverityDotColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'info':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

