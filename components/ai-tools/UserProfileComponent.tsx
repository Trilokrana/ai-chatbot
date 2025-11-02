"use client";
import type { UserProfileData } from "@/lib/types";
import { UserIcon } from "lucide-react";

const UserProfileComponent = ({ data }: { data: UserProfileData }) => {
  return (
    // --- Change: Added transition and hover shadow ---
    <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg my-2 border border-indigo-200 dark:border-indigo-700 transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-center space-x-4">
        {/* --- Change: Added hover scale --- */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full size-16 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
          <UserIcon className="size-8 text-gray-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{data.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{data.bio}</p>
        </div>
      </div>
      <div className="mt-3">
        <h4 className="font-semibold text-sm">Skills:</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {data.skills.map((skill, i) => (
            // --- Change: Added transition and hover bg/scale ---
            <span
              key={i}
              className="px-2 py-0.5 bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:bg-indigo-300 dark:hover:bg-indigo-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfileComponent;
