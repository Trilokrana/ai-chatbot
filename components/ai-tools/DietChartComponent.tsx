"use client";
import type { DietData } from "@/lib/types";

const DietChartComponent = ({ data }: { data: DietData }) => {
  if (!data || !Array.isArray(data.data)) return null;
  const total = data.data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f97316",
    "#ef4444",
    "#6366f1",
    "#f59e0b",
  ];
  let angle = -90;
  const center = 80;
  const radius = 60;
  const innerRadius = data.chartType === "donut" ? 34 : 0;

  const slices = data.data.map((d, i) => {
    const value = (d.value / total) * 360;
    const large = value > 180 ? 1 : 0;
    const start = angle;
    const end = angle + value;
    const rad = (deg: number) => (Math.PI * deg) / 180;
    const x1 = center + radius * Math.cos(rad(start));
    const y1 = center + radius * Math.sin(rad(start));
    const x2 = center + radius * Math.cos(rad(end));
    const y2 = center + radius * Math.sin(rad(end));
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    angle += value;
    return { path, color: colors[i % colors.length] };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg my-2 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-lg">
      <h3 className="font-bold text-lg mb-3">{data.title}</h3>
      <div className="flex items-center gap-6">
        <svg
          width={2 * center}
          height={2 * center}
          viewBox={`0 0 ${2 * center} ${2 * center}`}
          className="transition-all duration-300 group-hover:scale-105"
        >
          <g>
            {slices.map((s, i) => (
              <path
                key={i}
                d={s.path}
                fill={s.color}
                stroke="#ffffff"
                strokeWidth="1"
              />
            ))}
            {innerRadius > 0 && (
              <circle
                cx={center}
                cy={center}
                r={innerRadius}
                fill={data.chartType === "donut" ? "#fff" : "#fff"}
                className="dark:fill-gray-800"
              />
            )}
          </g>
        </svg>

        <div className="flex flex-col gap-2">
          {data.data.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-1 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span
                style={{ background: colors[i % colors.length] }}
                className="w-3 h-3 rounded-sm inline-block"
              />
              <span className="text-sm font-medium">{d.label}</span>
              <span className="text-xs text-gray-500 ml-2"> {d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-2">Plan: {data.plan}</div>
    </div>
  );
};

export default DietChartComponent;
