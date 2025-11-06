"use client";
import type { VideoData } from "@/lib/types";
import { YoutubeIcon } from "lucide-react";

const VideoComponent = ({ data }: { data: VideoData }) => {
  console.log("📹 [FRONTEND] VideoComponent got data:", data);
  const embedUrl = `https://www.youtube.com/embed/${data.videoId}`;
  return (
    <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg my-2 border border-red-200 dark:border-red-700 transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-center space-x-3 mb-2">
        <YoutubeIcon className="size-6 text-red-600 transition-all duration-300 group-hover:scale-110" />
        <h3 className="font-semibold">Video: {data.title}</h3>
      </div>
      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-lg"
          src={embedUrl}
          title={data.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoComponent;
