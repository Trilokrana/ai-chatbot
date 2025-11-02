// src/lib/types.ts

// --- Tool Data Types ---
export type ChartData = { year: number; salesData: { month: string; sales: number }[] };
export type DietData = { title: string; plan: string; chartType: "pie" | "donut"; data: { label: string; value: number }[] };
export type RecipeData = { recipeName: string; ingredients: string[]; instructions: string[]; prepTime: string };
export type ProductData = { productName: string; description: string; price: string; features: string[] };
export type MapData = { location: string; latitude: number; longitude: number; zoom: number };
export type WeatherData = { location: string; temperature: number; condition: string; humidity: number };
export type StockData = { ticker: string; price: number; change: string; marketCap: string };
export type VideoData = { query: string; videoId: string; title: string };
export type ImageData = { prompt: string; description: string };
export type UserProfileData = { name: string; bio: string; skills: string[] };

export type ToolData =
  | { type: "sales"; data: ChartData }
  | { type: "diet"; data: DietData }
  | { type: "recipe"; data: RecipeData }
  | { type: "product"; data: ProductData }
  | { type: "map"; data: MapData }
  | { type: "weather"; data: WeatherData }
  | { type: "stock"; data: StockData }
  | { type: "video"; data: VideoData }
  | { type: "image"; data: ImageData }
  | { type: "profile"; data: UserProfileData }
  | null;