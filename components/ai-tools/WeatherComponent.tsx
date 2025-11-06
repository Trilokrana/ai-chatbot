"use client";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity?: number;
}

export default function WeatherComponent({ data }: { data: WeatherData }) {
  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
        🌤️ Weather Information
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Location</p>
          <p className="text-lg font-semibold text-gray-900">{data.location}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Temperature</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.temperature}°C
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Condition</p>
          <p className="text-lg font-semibold text-gray-900">{data.condition}</p>
        </div>
        {data.humidity && (
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-600">Humidity</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.humidity}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
