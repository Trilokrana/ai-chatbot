// src/components/ai-tools/MapComponent.tsx
"use client";
import type { MapData } from "@/lib/types";

const MapComponent = ({ data }: { data: MapData }) => {
  console.log("📊 [FRONTEND] MapComponent got data:", data);
  // 1. API key ko .env.local se lein
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 2. Sahi Embed URL banayein
  // --- ⭐ FIX 3: URL ko sahi kiya (8{apiKey} -> ${apiKey}) ---
  const embedUrl = `https://www.google.com/maps/@$?key=${apiKey}&q=${encodeURIComponent(
    data.location
  )}&center=${data.latitude},${data.longitude}&zoom=${data.zoom}`;

  // 3. Agar API key nahi hai, toh error dikhayein
  if (!apiKey) {
    return (
      <div className="rounded-lg overflow-hidden my-2 border border-red-500 bg-red-50 dark:bg-red-900/50 shadow-sm p-4 text-center">
        <h3 className="font-bold text-red-700 dark:text-red-300">
          Map Error: API Key Missing
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">
          `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Please add your Google Maps API key to a `.env.local` file to display
          the map.
        </p>
      </div>
    );
  }

  // 4. Agar key hai, toh map render karein
  return (
    <div className="rounded-lg overflow-hidden my-2 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-lg group">
      <div className="relative bg-gray-100 dark:bg-gray-800 h-80">
        <iframe
          className="w-full h-full border-0"
          src={embedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${data.location}`}
        ></iframe>

        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/85 text-sm px-3 py-1 rounded-full shadow text-gray-800 dark:text-gray-100 transition-all duration-300 group-hover:scale-105">
          {data.location}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
