import { UIMessage, convertToModelMessages, streamText, tool } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* ---------------------- Schemas ---------------------- */
const schemas = {
  iphoneSales: z.object({
    year: z.number().default(2024),
    salesData: z.array(
      z.object({
        month: z.string(),
        sales: z.number().describe("Sales in millions"),
      })
    ),
  }),
  weather: z.object({
    location: z.string(),
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number().optional(),
  }),
  product: z.object({
    productName: z.string(),
    description: z.string(),
    price: z.string(),
    features: z.array(z.string()),
  }),
  recipe: z.object({
    recipeName: z.string(),
    prepTime: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
  }),
  diet: z.object({
    title: z.string(),
    plan: z.string(),
    chartType: z.enum(["pie", "donut"]),
    data: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
  stock: z.object({
    ticker: z.string(),
    price: z.number(),
    change: z.string(),
    marketCap: z.string(),
  }),
  map: z.object({
    location: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    zoom: z.number(),
  }),
  video: z.object({
    query: z.string(),
    videoId: z.string(),
    title: z.string(),
  }),
  image: z.object({
    prompt: z.string(),
    description: z.string(),
  }),
  userProfile: z.object({
    name: z.string(),
    bio: z.string(),
    skills: z.array(z.string()),
  }),
};

/* ---------------- Provider ---------------- */
const googleProvider = createGoogleGenerativeAI({
  apiKey:
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY,
});

/* ---------------- Tools ---------------- */
function buildTools() {
  const tools: Record<string, any> = {};

  for (const [name, schema] of Object.entries(schemas)) {
    tools[name] = tool({
      description: `Generate structured data for ${name}`,
      inputSchema: schema,
      execute: async (input: z.infer<typeof schema>) => {
        console.log(`✅ TOOL CALLED: ${name}`, input);
        return input;
      },
    });
  }

  tools.fallbackResponder = tool({
    description: "Handles general questions and non-structured prompts.",
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      console.log("⚠️ Fallback tool triggered for:", query);
      return { message: `No specific tool matched: ${query}` };
    },
  });

  return tools;
}

/* ---------------- Chat Handler ---------------- */
export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      messages?: UIMessage[];
      model?: string;
      webSearch?: boolean;
    };

    const uiMessages = payload.messages ?? [];
 
    const options = {
      model: payload.model,
      webSearch: payload.webSearch,
    };

    console.log("🟢 [BACKEND] Request received:", {
      totalMessages: uiMessages.length,
      model: options.model,
      webSearch: options.webSearch,
    });

    const modelId = (options.model ?? "google/gemini-2.5-flash").replace(
      /^google\//,
      ""
    );
    const model = google(modelId);

    const tools = buildTools();

    const systemInstructions = `
You are a structured data assistant.
When a user asks for data that fits any schema (like weather, product, sales, map, etc.),
you MUST call the appropriate tool and return a valid structured object.
Never reply with plain text or markdown JSON.
Always produce valid JSON matching the Zod schema of the selected tool.
`;

    const result = streamText({
      model,
      system: systemInstructions,
      messages: convertToModelMessages(uiMessages),
      tools,
      toolChoice: "auto",
      onError(err: any) {
        console.error("❌ [BACKEND] Stream error:", err);
      },

      onStepFinish(step: any) {
        console.log("🌿 [BACKEND] Step finished:", step);
      },

      onToolCall({ name, args }: any) {
        console.log("🧩 [BACKEND] Tool call detected:", name, args);
      },

      onToolResult({ name, result }: any) {
        console.log("📦 [BACKEND] Tool result:", name, result);
      },
    } as any);

    console.log("🚀 [BACKEND] Returning AI stream response…");
    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("🔥 [BACKEND] Chatbot error:", err);
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
