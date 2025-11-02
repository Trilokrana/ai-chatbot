import type {
  ToolData,
  ChartData,
  WeatherData,
  ProductData,
  RecipeData,
  StockData,
  MapData,
  VideoData,
  ImageData,
  DietData,
  UserProfileData,
} from "@/lib/types"; // <-- FIX: Import from @/lib/types

// Helper: extractToolData from tool parts (handles input/output/result shapes)
export const extractToolData = (parts: any[]): ToolData => {
  if (!parts || !Array.isArray(parts)) return null;

  try {
    // 1) Handle explicit parts that contain structured input/output/result
    for (const p of parts) {
      // common shapes: p.input, p.output, p.result
      const candidate = p?.input ?? p?.output ?? p?.result;
      if (candidate) {
        // HANDLE recipe wrapper forms: { tool: "showRecipe"|"getRecipe", input: {...} }
        if ((candidate?.tool === "showRecipe" || candidate?.tool === "getRecipe") && candidate?.input) {
          const r = candidate.input;
          if (r?.recipeName && Array.isArray(r.ingredients) && Array.isArray(r.instructions)) {
            return { type: "recipe", data: r as RecipeData };
          }
        }
        // also allow if candidate is already the direct recipe object
        if (candidate?.recipeName && Array.isArray(candidate.ingredients) && Array.isArray(candidate.instructions)) {
          return { type: "recipe", data: candidate as RecipeData };
        }

        // HANDLE diet tool invocation shape { tool: "showDietChart", input: { ... } }
        if (candidate?.tool === "showDietChart" && candidate?.input) {
          const d = candidate.input;
          if (d?.title && d?.plan && d?.chartType && Array.isArray(d.data)) {
            return { type: "diet", data: d as DietData };
          }
        }
        if (
          candidate?.year &&
          candidate?.salesData &&
          Array.isArray(candidate.salesData)
        ) {
          return { type: "sales", data: candidate as ChartData };
        }
        // also allow if candidate is already the inner input for diet
        if (
          candidate?.title &&
          candidate?.plan &&
          candidate?.chartType &&
          Array.isArray(candidate.data)
        ) {
          return { type: "diet", data: candidate as DietData };
        }
        if (candidate?.latitude && candidate?.longitude) {
          return { type: "map", data: candidate as MapData };
        }
        if (candidate?.location && candidate?.temperature !== undefined) {
          return { type: "weather", data: candidate as WeatherData };
        }
        if (candidate?.productName) {
          return { type: "product", data: candidate as ProductData };
        }
        if (candidate?.recipeName) {
          return { type: "recipe", data: candidate as RecipeData };
        }
        if (candidate?.ticker) {
          return { type: "stock", data: candidate as StockData };
        }
        if (candidate?.videoId) {
          return { type: "video", data: candidate as VideoData };
        }
        if (candidate?.prompt) {
          return { type: "image", data: candidate as ImageData };
        }
        if (candidate?.name && candidate?.skills) {
          return { type: "profile", data: candidate as UserProfileData };
        }
      }

      // 1b) If part itself is a "tool-input-available" style with .input object
      if (p?.type === "tool-input-available" && p.input) {
        const inp = p.input;
        if (inp?.year && inp?.salesData)
          return { type: "sales", data: inp as ChartData };
        if (inp?.latitude && inp?.longitude)
          return { type: "map", data: inp as MapData };
      }
    }

    // 2) Assemble streaming "tool-input-delta" pieces into a JSON string
    const deltaStrings = parts
      .filter(
        (p: any) =>
          p?.type === "tool-input-delta" &&
          (p.inputTextDelta || p.textDelta || p.delta || p.input)
      )
      .map(
        (p: any) =>
          p.inputTextDelta ??
          p.textDelta ??
          p.delta ??
          (typeof p.input === "string" ? p.input : "")
      );

    if (deltaStrings.length > 0) {
      const joined = deltaStrings.join("");
      try {
        const parsed = JSON.parse(joined);

        // recipe wrapper detection in streamed delta
        if ((parsed?.tool === "showRecipe" || parsed?.tool === "getRecipe") && parsed?.input) {
          const r = parsed.input;
          if (r?.recipeName && Array.isArray(r.ingredients) && Array.isArray(r.instructions)) {
            return { type: "recipe", data: r as RecipeData };
          }
        }
        // also allow direct recipe object in streamed JSON
        if (parsed?.recipeName && Array.isArray(parsed.ingredients) && Array.isArray(parsed.instructions)) {
          return { type: "recipe", data: parsed as RecipeData };
        }

        // if parsed object is { tool: "showDietChart", input: {...} }
        if (parsed?.tool === "showDietChart" && parsed?.input) {
          const d = parsed.input;
          if (d?.title && d?.plan && d?.chartType && Array.isArray(d.data)) {
            return { type: "diet", data: d as DietData };
          }
        }
        // if parsed is directly the inner input
        if (
          parsed?.title &&
          parsed?.plan &&
          parsed?.chartType &&
          Array.isArray(parsed.data)
        ) {
          return { type: "diet", data: parsed as DietData };
        }

        if (parsed?.year && parsed?.salesData)
          return { type: "sales", data: parsed as ChartData };
        if (parsed?.latitude && parsed?.longitude)
          return { type: "map", data: parsed as MapData };
        if (parsed?.location && parsed?.temperature !== undefined)
          return { type: "weather", data: parsed as WeatherData };
      } catch {
        // try to find JSON substring inside joined text (defensive)
        const m = joined.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            const parsed2 = JSON.parse(m[0]);
            if ((parsed2?.tool === "showRecipe" || parsed2?.tool === "getRecipe") && parsed2?.input) {
              const r2 = parsed2.input;
              if (r2?.recipeName && Array.isArray(r2.ingredients) && Array.isArray(r2.instructions)) {
                return { type: "recipe", data: r2 as RecipeData };
              }
            }
            if (parsed2?.tool === "showDietChart" && parsed2?.input) {
              const d = parsed2.input;
              if (d?.title && d?.plan && d?.chartType && Array.isArray(d.data)) {
                return { type: "diet", data: d as DietData };
              }
            }
            if (parsed2?.year && parsed2?.salesData)
              return { type: "sales", data: parsed2 as ChartData };
          } catch {}
        }
      }
    }

    // 3) Fallback: parse any text parts that might contain JSON
    for (const p of parts) {
      const txt = p?.text ?? p?.textDelta ?? p?.inputText ?? p?.inputTextDelta;
      if (typeof txt === "string" && txt.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(txt);
          if (parsed?.year && parsed?.salesData)
            return { type: "sales", data: parsed as ChartData };
        } catch {}
      }
    }
  } catch (err) {
    console.warn("extractToolData error", err);
  }

  return null;
};
