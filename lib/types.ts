// src/lib/types.ts

// --- Tool Data Types ---

export type SalesItem = {
  month: string;
  sales: number;
};

// ✅ Supports both bar and pie/donut views for iPhone sales
export type ChartData = {
  year: number;
  chartType?: "bar" | "pie" | "donut"; // optional, used for view switching
  salesData: SalesItem[];
};

// ✅ Used for diet or generic pie/donut charts
export type DietData = {
  title: string;
  plan: string;
  chartType: "pie" | "donut";
  data: { label: string; value: number }[];
};

export type RecipeData = {
  recipeName: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
};

export type ProductData = {
  productName: string;
  description: string;
  price: string;
  features: string[];
};

export type MapData = {
  location: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

export type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  humidity?: number; // optional for safety
};

export type StockData = {
  ticker: string;
  price: number;
  change: string;
  marketCap: string;
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

// ✅ Central union type — used by ToolRenderer
export type ToolData = {
  type: "weather" | "product" | "recipe" | "sales" | "diet" | "stock" | "map";
  data: any;
};
