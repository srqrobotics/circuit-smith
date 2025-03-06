import React, { useState } from "react";
import SearchBar from "./SearchBar";
import ComponentLibrary from "./ComponentLibrary";
import FileExplorer from "./FileExplorer";

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<"components" | "files">(
    "components"
  );

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 min-h-0">
      <SearchBar />
      <div className="flex space-x-2">
        <button
          className={`flex-1 py-2 ${activeTab === "components" ? "bg-gray-200" : ""}`}
          onClick={() => setActiveTab("components")}
        >
          Components
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === "files" ? "bg-gray-200" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          Files
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "components" ? (
          <div className="flex-1 h-full">
            <ComponentLibrary />
          </div>
        ) : (
          <FileExplorer />
        )}
      </div>
    </div>
  );
}
