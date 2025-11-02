"use client";
import type { ProductData } from "@/lib/types";
import { ShoppingCartIcon } from "lucide-react";

const ProductComponent = ({ data }: { data: ProductData }) => {
  return (
    // --- Change: Added transition and hover shadow ---
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg my-2 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-lg group">
      <div className="flex space-x-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg size-24 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
          <ShoppingCartIcon className="size-12 text-gray-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{data.productName}</h3>
          <p className="text-xl font-semibold text-green-600">{data.price}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {data.description}
          </p>
          <ul className="text-xs list-disc list-inside mt-2 text-gray-500 dark:text-gray-400">
            {data.features?.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductComponent;
