"use client";
import type { ChartData } from "@/lib/types";

const BarChartComponent = ({ data }: { data: ChartData }) => {
  if (!data || !data.salesData) return null;
  const maxSales = Math.max(...data.salesData.map((d) => d.sales), 1);
  return (
    // --- Change: Added transition and hover shadow ---
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-2 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      <h3 className="font-bold text-lg mb-3">
        iPhone Sales for {data.year} (in millions)
      </h3>
      <div className="space-y-2">
        {data.salesData.map((item) => (
          // --- Change: Added group for hover effect ---
          <div key={item.month} className="flex items-center space-x-2 group">
            <div className="w-20 font-medium text-sm text-gray-600 dark:text-gray-300">
              {item.month}
            </div>
            <div
              // --- Change: Added hover brightness ---
              className="flex-1 bg-blue-500 h-6 rounded transition-all duration-300 ease-out group-hover:brightness-110"
              style={{ width: `${(item.sales / maxSales) * 90 + 10}%` }}
            >
              <span className="ml-2 text-white font-bold text-sm">
                {item.sales}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChartComponent;
