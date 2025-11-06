"use client";
import type { StockData } from "@/lib/types";
import { LineChartIcon } from "lucide-react";

const StockComponent = ({ data }: { data: StockData }) => {
  console.log("📈 [FRONTEND] StockComponent got data:", data);
  const isPositive = !data.change.startsWith("-");
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-2 border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-center space-x-3">
        <LineChartIcon className="size-8 text-gray-500 transition-all duration-300 group-hover:scale-110" />
        <div>
          <h3 className="font-bold text-lg">{data.ticker}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Market Cap: {data.marketCap}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-semibold">${data.price.toFixed(2)}</p>
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {data.change}
        </p>
      </div>
    </div>
  );
};

export default StockComponent;
