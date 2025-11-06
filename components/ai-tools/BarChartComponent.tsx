"use client";
import type { ChartData } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#a855f7", // purple-500
  "#f97316", // orange-500
];

const PieChartComponent = ({ data }: { data: ChartData }) => {
  console.log("📊 [FRONTEND] PieChartComponent got data:", data);
  if (!data || !data.salesData) return null;

  const chartData = data.salesData.map((d) => ({
    name: d.month,
    value: d.sales,
  }));

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      <h3 className="font-bold text-lg mb-4 text-center">
        iPhone Sales for {data.year} (in millions)
      </h3>

      <div className="w-full h-[350px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={3}
              label={({ name, value }: any) => `${name}: ${value}`}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.75)",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartComponent;
