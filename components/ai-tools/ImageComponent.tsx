"use client";
import type { ImageData } from "@/lib/types";
import { ImageIcon } from "lucide-react";

const ImageComponent = ({ data }: { data: ImageData }) => {
  console.log("🖼️ [FRONTEND] ImageComponent got data:", data);
  return (
    <div className="bg-purple-50 dark:bg-purple-900/50 p-4 rounded-lg my-2 border border-purple-200 dark:border-purple-700 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center space-x-3 mb-2">
        <ImageIcon className="size-6 text-purple-600" />
        <h3 className="font-semibold">Image Generation Request</h3>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-40 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-col px-4 text-center group transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-600">
        <p className="font-medium transition-all group-hover:scale-110">[Image Placeholder]</p>
        <p className="text-sm italic">"{data.prompt}"</p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
        {data.description}
      </p>
    </div>
  );
};

export default ImageComponent;