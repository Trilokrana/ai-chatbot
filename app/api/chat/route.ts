import {
  UIMessage,
  convertToModelMessages,
  streamText,
  tool,
  type Tool,
} from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  condition: z.string().describe("The weather condition, e.g., 'Sunny', 'Cloudy'"),
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
  title: z.string().describe("The title of the diet plan, e.g., 'High Protein Plan'"),
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
  location: z.string().describe("The location to show on the map, e.g., 'Eiffel Tower'"),
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
  description: z.string().describe("A short description of the generated image"),
});

const userProfileSchema = z.object({
  name: z.string().describe("The user's full name"),
  bio: z.string().describe("A short biography"),
  skills: z.array(z.string()).describe("A list of the user's skills"),
});


function createEchoTool(description: string, schema: z.ZodTypeAny) {
  return tool({
    description,
    parameters: schema as any,
    inputSchema: schema as any,
    async execute(arg: any) {
      return (arg && typeof arg === "object" && "input" in arg) ? (arg as any).input : arg;
    },
  } as any) as any;
}


const allTools: Record<string, any> = {
  showIphoneSalesGraph: createEchoTool(
    "Show a bar graph of iPhone sales data for a specified year.",
    iphoneSalesSchema
  ),
  getWeather: createEchoTool("Get the current weather for a specific location.", weatherSchema),
  findProduct: createEchoTool("Find and display information about a product.", productSchema),
  getRecipe: createEchoTool("Get a recipe for a specific dish.", recipeSchema),
  showDietChart: createEchoTool(
    "Show a pie or donut chart for a diet plan's macronutrient breakdown.",
    dietSchema
  ),
  getStockPrice: createEchoTool(
    "Get the current stock price for a ticker symbol.",
    stockSchema
  ),
  showMap: createEchoTool("Show a map of a specific location.", mapLocationSchema),
  findVideo: createEchoTool("Find a video (e.g., on YouTube) and show an embed.", videoSearchSchema),
  showImagePlaceholder: createEchoTool(
    "Show a placeholder for a generated image based on a prompt.",
    imageSchema
  ),
  showUserProfile: createEchoTool("Display a user profile card.", userProfileSchema),
};


export async function POST(req: Request) {
  const payload = (await req.json()) as {
    messages?: UIMessage[];
    body?: { model?: string; webSearch?: boolean };
  };

  const messages = payload.messages ?? [];
  const requestOptions = payload.body ?? {};

  const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY,
  });

  const convertedMessages = convertToModelMessages(messages);

  const systemInstructions: string[] = [
    "You are a helpful and dynamic AI assistant. Your goal is to provide a great, interactive experience.",
    "When a user asks a question, first provide a concise text-based answer.",
    "Then, if the answer can be enhanced with a visual component, you MUST ALSO call the appropriate tool to provide that component.",
    "For `getRecipe`, `showUserProfile`, `findProduct`, `showIphoneSalesGraph`, `showDietChart`: You MUST generate a plausible, fictional set of data that fits the entire schema.",
    "Example for `showDietChart`: If the user says 'keto', generate a high-fat (70%), mid-protein (25%), low-carb (5%) breakdown and a 'donut' chartType.",
    "For `showMap`: Extract the location name (e.g., 'Taj Mahal') and put it in the `location` field. You MUST also generate a realistic `latitude`, `longitude`, and `zoom` (e.g., 15) for it.",
    "For `showImagePlaceholder`: Extract the user's idea (e.g., 'minimalist coffee bean') and put it in the `prompt` field. You MUST generate a brief `description` for it.",
    "ALWAYS provide a text response *with* the tool call. Never call a tool without text.",
  ];

  let toolsToUse: Record<string, Tool<any, any>> = { ...allTools };

  if (requestOptions.webSearch) {
    systemInstructions.push(
      "Web search is ENABLED. When a user asks for a specific video, try to provide a realistic `videoId` and `title`, then call the `findVideo` tool."
    );
    const googleSearchTool = (googleProvider as any)?.search;
    if (typeof googleSearchTool === "function") {
      toolsToUse = {
        ...toolsToUse,
        search: googleSearchTool.call(googleProvider) as Tool<any, any>,
      };
    }
  } else {
    systemInstructions.push(
      "Web search is DISABLED. For `findVideo`, mention that you cannot perform live search, then generate a plausible fictional `videoId` and `title`."
    );
  }

  const modelFromClient = requestOptions.model ?? "google/gemini-2.5-flash";
  const modelId = modelFromClient.replace(/^google\//, "");
  const model = google(modelId as any);

  const result = streamText({
    model,
    messages: convertedMessages,
    tools: toolsToUse,
    system: systemInstructions.join(" "),
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true });
}