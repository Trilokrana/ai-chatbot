import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// src/lib/types.ts

// --- Tool Data Types ---
export type ChartData = {
  year: number;
  salesData: { month: string; sales: number }[];
};
export type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
};
export type ProductData = {
  productName: string;
  description: string;
  price: string;
  features: string[];
};
export type RecipeData = {
  recipeName: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
};
export type StockData = {
  ticker: string;
  price: number;
  change: string;
  marketCap: string;
};
export type MapData = {
  location: string;
  latitude: number;
  longitude: number;
  zoom: number;
};
export type VideoData = {
  query: string;
  videoId: string;
  title: string;
};
export type ImageData = {
  prompt: string;
  description: string;
};
export type UserProfileData = {
  name: string;
  bio: string;
  skills: string[];
};
export type DietData = {
  title: string;
  plan: string;
  chartType: "pie" | "donut";
  data: { label: string; value: number }[];
};

export type ToolData =
  | { type: "sales"; data: ChartData }
  | { type: "weather"; data: WeatherData }
  | { type: "product"; data: ProductData }
  | { type: "recipe"; data: RecipeData }
  | { type: "stock"; data: StockData }
  | { type: "map"; data: MapData }
  | { type: "video"; data: VideoData }
  | { type: "image"; data: ImageData }
  | { type: "diet"; data: DietData }
  | { type: "profile"; data: UserProfileData }
  | null;
