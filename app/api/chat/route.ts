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
      description: `Generate structured ${name} data when user specifically requests ${name} information with intent to display it`,
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

    // FIXED SYSTEM PROMPT - More flexible and clear
    const systemPrompt = `You are a helpful, knowledgeable AI assistant. You can:

1. **Answer ANY general questions** - math, conversions, facts, explanations, etc.
2. **Have conversations** - chat about any topic freely
3. **Write content** - essays, poems, stories, explanations
4. **Provide information** - on any subject you know about
5. **Use specialized tools** ONLY when user specifically wants structured data displays

## When to use tools (be very specific):
- Weather tool: "What's the weather in [city]?" or "Show me weather for [location]"
- Product tool: "Tell me about [specific product]" or "Show me details for [product]" 
- Recipe tool: "Give me a recipe for [dish]" or "How to make [food]"
- Sales tool: "Show iPhone sales data" or "iPhone sales by month"
- Diet tool: "Create a diet plan" or "Show me a nutrition chart"
- Stock tool: "What's [company] stock price?" (for current stock data display)
- Map tool: "Show me [location] on a map" or "Map coordinates for [place]"

## When NOT to use tools:
- Currency conversions (1 USD = ₹83 approximately)
- General math questions
- Historical information
- Explanations and definitions
- General knowledge queries
- Conversational questions

**IMPORTANT**: For questions like "What is the price of one dollar in Indian rupees?", just answer directly: "1 USD is approximately ₹83 (exchange rates fluctuate)". Don't use tools for this.

Always be helpful and answer every reasonable question directly unless it specifically requires structured data visualization.`;

    console.log("📨 Processing request with", messages.length, "messages");
    console.log("📝 User query:", messages[messages.length - 1]?.content);

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
