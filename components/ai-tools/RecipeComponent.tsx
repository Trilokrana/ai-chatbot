"use client";
import type { RecipeData } from "@/lib/types";

export default function RecipeComponent({ data }: { data: RecipeData }) {
  console.log("🍽️ [FRONTEND] RecipeComponent got data:", data);
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded border px-8 py-5 text-sm transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-semibold mb-2">{data.recipeName}</h3>
      <div className="mb-3 text-sm">Prep Time: {data.prepTime}</div>

      <div>
        <strong className="block mb-2">Ingredients:</strong>
        <ul className="list-disc list-inside space-y-1.5">
          {data.ingredients.map((ing, i) => (
            <li
              key={i}
              className="transition-all duration-200 hover:text-black dark:hover:text-white"
            >
              {ing}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <strong className="block mb-2">Instructions:</strong>
        <ol className="list-decimal list-inside space-y-1.5">
          {data.instructions.map((step, i) => (
            <li
              key={i}
              className="transition-all duration-200 hover:text-black dark:hover:text-white"
            >
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
