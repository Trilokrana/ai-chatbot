import { convertToCoreMessages, generateText, tool, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ==================== Schemas for Structured Data ==================== */
const schemas = {
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
  iphoneSales: z.object({
    year: z.number().default(2024),
    salesData: z.array(
      z.object({
        month: z.string(),
        sales: z.number().describe("Sales in millions"),
      })
    ),
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
};

/* ==================== Build Tools ==================== */
function buildTools(modelInstance: ReturnType<typeof google>) {
  const tools: Record<string, any> = {};

  for (const [name, schema] of Object.entries(schemas)) {
    tools[name] = tool({
      description: `Generate structured ${name} data when user asks for ${name}`,
      parameters: z.object({
        userRequest: z.string().describe(`The user's request for ${name} data`),
      }),
      async execute({ userRequest }: { userRequest: string }) {
        try {
          console.log(`🔄 Generating ${name} for: ${userRequest}`);

          const { object } = await generateObject({
            model: modelInstance,
            schema: schema as z.ZodType,
            prompt: userRequest,
            system: `Generate realistic ${name} data. Return ONLY valid JSON.`,
          });

          console.log(`✅ Generated ${name}:`, object);
          return object;
        } catch (error) {
          console.error(`❌ Error generating ${name}:`, error);
          throw error;
        }
      },
    });
  }

  return tools;
}

/* ==================== Chat Handler ==================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const modelName = body.model || "gemini-2.0-flash";

    const model = google(modelName);
    const tools = buildTools(model);

    const systemPrompt = `You are a helpful AI assistant. You can:
1. Answer any general questions completely
2. Write essays, poems, stories in full
3. Generate structured data using tools when specifically asked

For general questions, respond with complete, detailed answers.
Use tools only when user asks for weather, products, recipes, sales data, diet plans, stock info, or maps.

Be thorough and helpful.`;

    console.log("📨 Processing request with", messages.length, "messages");

    // USE generateText instead of streamText for complete responses
    const result = await generateText({
      model,
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      tools,
      toolChoice: "auto",
      maxTokens: 8192,
    });

    console.log("✅ Generated response:", result.text.substring(0, 100));
    console.log("🔧 Tool results:", result.toolResults?.length || 0);

    // Return complete response with tool results
    return new Response(
      JSON.stringify({
        content: result.text,
        toolResults: result.toolResults || [],
        usage: result.usage,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("🔥 API Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
