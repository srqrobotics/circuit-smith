import React from "react";
import ComponentsSidebar from "./ComponentsSidebar";
import { FaMicrochip } from "react-icons/fa";

export default function LeftSidebar() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button className="flex-1 py-2 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <FaMicrochip />
        </button>
      </div>

      {/* Component Content */}
      <div className="flex-1 overflow-y-auto w-full h-full">
        <div className="w-full h-full">
          <ComponentsSidebar />
        </div>
      </div>
    </div>
  );
}
