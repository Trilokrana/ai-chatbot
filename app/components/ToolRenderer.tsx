"use client";
import React from "react";
import type { ToolData } from "@/lib/types";
import BarChartComponent from "@/components/ai-tools/BarChartComponent";
import DietChartComponent from "@/components/ai-tools/DietChartComponent";
import RecipeComponent from "@/components/ai-tools/RecipeComponent";
import ProductComponent from "@/components/ai-tools/ProductComponent";
import MapComponent from "@/components/ai-tools/MapComponent";
import WeatherComponent from "@/components/ai-tools/WeatherComponent";
import StockComponent from "@/components/ai-tools/StockComponent";
import VideoComponent from "@/components/ai-tools/VideoComponent";
import ImageComponent from "@/components/ai-tools/ImageComponent";
import UserProfileComponent from "@/components/ai-tools/UserProfileComponent";

export const ToolRenderer = ({ data }: { data: ToolData }) => {
  if (!data) return null;
  switch (data.type) {
    case "sales":
      return <BarChartComponent data={data.data} />;
    case "diet":
      return <DietChartComponent data={data.data} />;
    case "recipe":
      return <RecipeComponent data={data.data} />;
    case "product":
      return <ProductComponent data={data.data} />;
    case "map":
      return <MapComponent data={data.data} />;
    case "weather":
      return <WeatherComponent data={data.data} />;
    case "stock":
      return <StockComponent data={data.data} />;
    case "video":
      return <VideoComponent data={data.data} />;
    case "image":
      return <ImageComponent data={data.data} />;
    case "profile":
      return <UserProfileComponent data={data.data} />;
    default:
      return null;
  }
};
export default ToolRenderer;