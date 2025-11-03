"use client";
import type { WeatherData } from "@/lib/types";
import { CloudSunIcon } from "lucide-react";

const WeatherComponent = ({ data }: { data: WeatherData }) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg my-2 border border-blue-200 dark:border-blue-700 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg group">
      <CloudSunIcon className="size-12 text-blue-500 transition-all duration-300 group-hover:scale-110" />
      <div>
        <h3 className="font-bold text-lg">{data.location}</h3>
        <p className="text-2xl font-semibold">{data.temperature}°C</p>
        <p className="text-gray-700 dark:text-gray-300">{data.condition}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Humidity: {data.humidity}%
        </p>
      </div>
    </div>
  );
};

export default WeatherComponent;
