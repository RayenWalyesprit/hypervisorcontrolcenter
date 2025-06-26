import { useEffect, useState } from "react";
import axios from "@/context/axios";
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border px-2 py-1 rounded shadow text-xs text-gray-800">
        <p>{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
interface SummaryResponse {
  by_level: Record<string, number>;
  by_resource: Record<string, number>;
  top_vms: { vm_ip: string; alert_count: number }[];
}

type PieData = { name: string; value: number }[];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333"fontSize={10}>
        {`PV ${value}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999"fontSize={10}>
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function AlertsSummary() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const [days, setDays] = useState(7); // default range for last 7 days

  const fetchSummary = () => {
    axios
      .get<SummaryResponse>(`/api/alerts/summary?days=${days}`)
      .then((res) => {
        setSummary(res.data);
      })
      .catch((err) => console.error("Failed to fetch summary:", err));
  };

  useEffect(() => {
    fetchSummary();
  }, [days]);

  if (!summary) return <p>Loading...</p>;

  const byLevelData: PieData = Object.entries(summary.by_level).map(
    ([key, val]) => ({ name: key.toUpperCase(), value: val })
  );

  const byResourceData: PieData = Object.entries(summary.by_resource).map(
    ([key, val]) => ({ name: key.toUpperCase(), value: val })
  );

  return (
    <div className="p-4">
      {/* Date Filter */}
      <div className="mb-4 flex items-center gap-2">
  <label className="text-sm font-medium text-gray-700">
    Filter by:
  </label>
  <select
    value={days}
    onChange={(e) => setDays(parseInt(e.target.value))}
    className="border border-gray-300 rounded px-2 py-1 text-sm"
  >
    <option value={1}>Last 1 day</option>
    <option value={3}>Last 3 days</option>
    <option value={7}>Last 7 days</option>
    <option value={14}>Last 14 days</option>
    <option value={30}>Last 30 days</option>
  </select>
</div>

      {/* Charts & Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pie Chart 1 */}
        <div>
          <h3 className="text-center text-sm font-semibold mb-2">Alerts by Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={byLevelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                activeIndex={activeIndex1}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex1(index)}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart 2 */}
        <div>
          <h3 className="text-center text-sm font-semibold mb-2">Alerts by Resource</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={byResourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#82ca9d"
                dataKey="value"
                activeIndex={activeIndex2}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex2(index)}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mini Table */}
        <div>
          <h3 className="text-center text-sm font-semibold mb-2">Top Alerting VMs</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1">VM</th>
                <th className="py-1 text-right">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {summary.top_vms.map((vm, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">{vm.vm_ip}</td>
                  <td className="py-1 text-right">{vm.alert_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
