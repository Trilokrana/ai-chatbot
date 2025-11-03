import { UIMessage, convertToModelMessages, streamText } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ---------- Schemas ----------
const iphoneSalesSchema = z.object({
  year: z.number().describe("The year for the sales data"),
  salesData: z.array(
    z.object({
      month: z.string(),
      sales: z.number().describe("Number of sales in millions"),
    })
  ),
});

const weatherSchema = z.object({
  location: z.string().describe("The city and state, e.g., San Francisco, CA"),
  temperature: z.number().describe("The current temperature in Celsius"),
  condition: z
    .string()
    .describe("The weather condition, e.g., 'Sunny', 'Cloudy'"),
  humidity: z.number().describe("The humidity percentage"),
});

const productSchema = z.object({
  productName: z.string().describe("The name of the product"),
  description: z.string().describe("A brief description of the product"),
  price: z.string().describe("The price of the product, e.g., '$999.00'"),
  features: z.array(z.string()).describe("A list of key features"),
});

const recipeSchema = z.object({
  recipeName: z.string().describe("The name of the dish"),
  prepTime: z.string().describe("The preparation time, e.g., '30 minutes'"),
  ingredients: z.array(z.string()).describe("A list of ingredients"),
  instructions: z.array(z.string()).describe("Step-by-step instructions"),
});

const dietSchema = z.object({
  title: z
    .string()
    .describe("The title of the diet plan, e.g., 'High Protein Plan'"),
  plan: z.string().describe("A brief description of the plan"),
  chartType: z.enum(["pie", "donut"]).describe("The type of chart to display"),
  data: z.array(
    z.object({
      label: z.string().describe("The macronutrient, e.g., 'Protein'"),
      value: z.number().describe("The percentage, e.g., 40"),
    })
  ),
});

const stockSchema = z.object({
  ticker: z.string().describe("The stock ticker symbol, e.g., 'AAPL'"),
  price: z.number().describe("The current stock price"),
  change: z.string().describe("The change in price, e.g., '+0.50 (0.25%)'"),
  marketCap: z.string().describe("The market capitalization, e.g., '$2.5T'"),
});

const mapLocationSchema = z.object({
  location: z
    .string()
    .describe("The location to show on the map, e.g., 'Taj Mahal'"),
  latitude: z.number().describe("The latitude of the location"),
  longitude: z.number().describe("The longitude of the location"),
  zoom: z.number().describe("The zoom level for the map, e.g., 15"),
});

const videoSearchSchema = z.object({
  query: z.string().describe("The search query for the video"),
  videoId: z.string().describe("The YouTube video ID, e.g., 'dQw4w9WgXcQ'"),
  title: z.string().describe("The title of the video"),
});

const imageSchema = z.object({
  prompt: z.string().describe("The text prompt used to imagine the image"),
  description: z
    .string()
    .describe("A short description of the generated image"),
});

const userProfileSchema = z.object({
  name: z.string().describe("The user's full name"),
  bio: z.string().describe("A short biography"),
  skills: z.array(z.string()).describe("A list of the user's skills"),
});
// ---------- End Schemas ----------

// Use schemas directly as Generative UI tools
const allTools: Record<string, any> = {
  showIphoneSalesGraph: iphoneSalesSchema,
  getWeather: weatherSchema,
  findProduct: productSchema,
  getRecipe: recipeSchema,
  showDietChart: dietSchema,
  getStockPrice: stockSchema,
  showMap: mapLocationSchema,
  findVideo: videoSearchSchema,
  showImagePlaceholder: imageSchema,
  showUserProfile: userProfileSchema,
};

export async function POST(req: Request) {
  const payload = (await req.json()) as {
    messages?: UIMessage[];
    body?: { model?: string; webSearch?: boolean };
  };

  const messages = payload.messages ?? [];
  const requestOptions = payload.body ?? {};

  const googleProvider = createGoogleGenerativeAI({
    apiKey:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY,
  });

  const convertedMessages = convertToModelMessages(messages);

  const systemInstructions: string[] = [
    "You are a helpful and dynamic AI assistant. Provide a concise text answer.",
    "If a visual helps, ALSO call the appropriate tool with a complete payload.",
    "Generate plausible data that fits the schema when values are missing.",
    "For showMap: fill location, latitude, longitude, zoom (e.g., 15).",
    "Always include text plus the tool call.",
  ];


  let toolsToUse: Record<string, any> = { ...allTools };

  if (requestOptions.webSearch) {
    const googleSearchTool = (googleProvider as any)?.search;
    if (typeof googleSearchTool === "function") {
      toolsToUse.search = googleSearchTool.call(googleProvider);
      systemInstructions.push(
        "Web search is ENABLED; for findVideo try to return a real videoId and title."
      );
    } else {
      systemInstructions.push(
        "Web search not available; for findVideo generate a plausible fictional videoId and title."
      );
    }
  } else {
    systemInstructions.push(
      "Web search is DISABLED; for findVideo generate a plausible fictional videoId and title."
    );
  }

  const modelFromClient = requestOptions.model ?? "google/gemini-2.0-flash";
  const modelId = modelFromClient.replace(/^google\//, "");
  const model = google(modelId as any);

  const result = streamText({
    model,
    messages: convertedMessages,
    // tools: toolsToUse, 
    system: systemInstructions.join(" "),
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true });
}
