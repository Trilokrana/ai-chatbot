// src/components/ai-tools/MapComponent.tsx
"use client";
import { useState, useEffect } from "react";
import type { MapData } from "@/lib/types";

const MapComponent = ({ data }: { data: MapData }) => {
  console.log("📊 [FRONTEND] MapComponent got data:", data);
  
  const { latitude, longitude, location, zoom } = data;
  const [mapError, setMapError] = useState(false);
  
  // Multiple embed options to try
  const mapUrls = [
    // Option 1: OpenStreetMap (most reliable)
    `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`,
    
    // Option 2: uMap embed
    `https://umap.openstreetmap.fr/en/map/anonymous-edit/12345#${zoom}/${latitude}/${longitude}`,
    
    // Option 3: Simple OSM tile server approach
    `data:text/html,<html><head><title>Map</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script></head><body style="margin:0;padding:0;"><div id="map" style="width:100%;height:100vh;"></div><script>var map = L.map('map').setView([${latitude}, ${longitude}], ${zoom || 15});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'}).addTo(map);L.marker([${latitude}, ${longitude}]).addTo(map).bindPopup('${location.replace(/'/g, "\\'")}').openPopup();</script></body></html>`
  ];
  
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  
  const handleMapError = () => {
    console.warn(`Map failed to load, trying alternative...`);
    if (currentUrlIndex < mapUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setMapError(true);
    }
  };
  
  // Google Maps links
  const googleMapsUrl = `https://www.google.com/maps/place/${encodeURIComponent(location)}/@${latitude},${longitude},${zoom || 15}z`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
  
  // If all maps fail, show a fallback
  if (mapError) {
    return (
      <div className="rounded-lg overflow-hidden my-2 border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 shadow-sm">
        <div className="p-6 text-center space-y-4">
          {/* Header */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl">🗺️</span>
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              {location}
            </h3>
          </div>
          
          {/* Coordinates */}
          <div className="bg-orange-100 dark:bg-orange-800/50 rounded-lg p-3">
            <p className="text-orange-700 dark:text-orange-300 font-mono text-sm">
              📍 Latitude: {latitude.toFixed(6)}
            </p>
            <p className="text-orange-700 dark:text-orange-300 font-mono text-sm">
              📍 Longitude: {longitude.toFixed(6)}
            </p>
            <p className="text-orange-700 dark:text-orange-300 font-mono text-sm">
              🔍 Zoom: {zoom}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              🌍 Open in Google Maps
            </a>
            
            <a
              href={`https://www.openstreetmap.org/#map=${zoom}/${latitude}/${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              🗺️ Open in OpenStreetMap
            </a>
          </div>
          
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Map embedding is currently unavailable. Click above to view on external maps.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg overflow-hidden my-2 border border-blue-200 dark:border-blue-700 shadow-sm transition-all duration-300 hover:shadow-lg group">
      <div className="relative bg-gray-100 dark:bg-gray-800 h-80">
        <iframe
          key={currentUrlIndex} // Force re-render when URL changes
          className="w-full h-full border-0"
          src={mapUrls[currentUrlIndex]}
          allowFullScreen
          loading="lazy"
          title={`Map of ${location}`}
          onLoad={() => console.log('✅ Map loaded successfully')}
          onError={handleMapError}
          style={{ border: 'none' }}
        />

        {/* Location overlay */}
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-100 text-sm px-3 py-1 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105">
          📍 {location}
        </div>
        
        {/* Coordinates overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded shadow-lg">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>

        {/* External link button */}
        <div className="absolute bottom-3 right-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          >
            🌍 Open
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
