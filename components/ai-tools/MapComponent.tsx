// src/components/ai-tools/MapComponent.tsx
"use client";
import type { MapData } from "@/lib/types";

const MapComponent = ({ data }: { data: MapData }) => {
  // 1. Get the API key from your environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log("Google Maps API Key:", apiKey);

  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
    data.location
  )}&center=${data.latitude},${data.longitude}&zoom=${data.zoom}`;

  if (!apiKey) {
    return (
      <div className="rounded-lg overflow-hidden my-2 border border-red-500 bg-red-50 dark:bg-red-900/50 shadow-sm p-4 text-center">
        <p className="font-semibold text-red-700 dark:text-red-300">
          Google Maps API key missing.
        </p>
        <p className="text-sm text-red-600 dark:text-red-200">
          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.
        </p>
      </div>
    );
  }

  // 4. If the key exists, render the actual map
  return (
    <div className="rounded-lg overflow-hidden my-2 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-lg group">
      <div className="relative bg-gray-100 dark:bg-gray-800 h-80">
        <iframe
          title={`Map of ${data.location}`}
          src={embedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default MapComponent;
