"use client";

import React from "react";
import type { ToolData } from "@/lib/types";
import WeatherComponent from "@/components/ai-tools/WeatherComponent";
import ProductComponent from "@/components/ai-tools/ProductComponent";
import RecipeComponent from "@/components/ai-tools/RecipeComponent";

interface ToolRendererProps {
  data: ToolData;
}

const ToolRenderer: React.FC<ToolRendererProps> = ({ data }) => {
  console.log("🎨 Rendering Tool:", data.type, data);

  if (!data) {
    return <div className="text-red-500">No data to display</div>;
  }

  switch (data.type) {
    case "weather":
      return <WeatherComponent data={data.data} />;
    case "product":
      return <ProductComponent data={data.data} />;
    case "recipe":
      return <RecipeComponent data={data.data} />;
    case "sales":
      return (
        <div className="p-4 rounded">
          <h3 className="text-lg font-bold mb-3">📊 Sales Data</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      );
    case "diet":
      return (
        <div className="p-4 rounded">
          <h3 className="text-lg font-bold mb-3">🥗 Diet Plan</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      );
    case "stock":
      return (
        <div className="p-4  rounded">
          <h3 className="text-lg font-bold mb-3">📈 Stock Info</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      );
    case "map":
      return (
        <div className="p-4 rounded">
          <h3 className="text-lg font-bold mb-3">🗺️ Map Location</h3>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      );
    default:
      return (
        <div className="p-4 bg-red-100 rounded text-red-800">
          Unknown tool type: {data.type}
        </div>
      );
  }
};

export default ToolRenderer;
