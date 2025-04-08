import React, { useState, useRef, useEffect } from "react";
import Canvas from "../Canvas/Canvas";
import {
  FaPlay,
  FaCode,
  FaTable,
  FaMicrochip,
  FaFileCode,
} from "react-icons/fa";
import { IoMdUndo, IoMdRedo } from "react-icons/io";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { FiSun, FiMoon } from "react-icons/fi";
import ComponentsSidebar from "../Sidebar/ComponentsSidebar";
import RightSidebar from "../Sidebar/RightSidebar";
import { useTheme } from "~/contexts/ThemeContext";
import { useFile } from "~/contexts/FileContext";
import { useAutoRouting } from "~/contexts/AutoRoutingContext";

export default function Layout() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { setSelectedFile, selectedFile } = useFile();
  const { autoRoutingEnabled, toggleAutoRouting } = useAutoRouting();
  const [activeRightTab, setActiveRightTab] = useState<"components" | "code">(
    "components"
  );
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const handleCodeButtonClick = () => {
    setSelectedFile("/projects/defaultCode.ino");
    setActiveRightTab("code");
  };

  const handleTableButtonClick = () => {
    setSelectedFile("/configs/demo.json");
    setActiveRightTab("code");
  };

  // Handle resizing
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsResizing(true);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = rightPanelWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStartX.current;
        const newWidth = Math.max(
          100,
          Math.min(window.innerWidth - 200, resizeStartWidth.current - deltaX)
        );
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };

    const resizeHandle = document.querySelector(".resize-handle");
    if (resizeHandle) {
      resizeHandle.addEventListener("mousedown", handleMouseDown);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };
  }, [isResizing, rightPanelWidth]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          {/* Project Title */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Circuit Smith
          </h1>

          {/* Basic Controls */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
              <IoMdUndo />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
              <IoMdRedo />
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
              <BsZoomIn />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
              <BsZoomOut />
            </button>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-900 dark:text-gray-100"
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button
            id="layout-auto-route-button"
            className={`flex items-center gap-2 px-3 py-1.5 ${
              autoRoutingEnabled
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white rounded-md transition-colors`}
            onClick={toggleAutoRouting}
          >
            <span id="layout-auto-route-text">
              {autoRoutingEnabled ? "Stop Routing" : "Auto Route"}
            </span>
          </button>
          <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center space-x-2">
            <FaPlay className="text-sm" />
            <span>Start Simulation</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Canvas Area */}
        <div
          className="absolute inset-0 bg-gray-50 dark:bg-gray-800"
          style={{ right: `${rightPanelWidth + 1}px` }}
        >
          <Canvas />
        </div>

        {/* Resizable Handle */}
        <div
          className="resize-handle absolute w-2 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors duration-150"
          style={{
            right: `${rightPanelWidth}px`,
            height: "100%",
            zIndex: 10,
          }}
        />

        {/* Right Sidebar with Tabs */}
        <div
          ref={rightPanelRef}
          style={{ width: `${rightPanelWidth}px` }}
          className="absolute right-0 top-0 bottom-0 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 min-h-0"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 flex items-center justify-center ${activeRightTab === "components" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              onClick={() => setActiveRightTab("components")}
            >
              <FaMicrochip />
            </button>
            <button
              className={`flex-1 py-2 flex items-center justify-center ${activeRightTab === "code" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              onClick={() => setActiveRightTab("code")}
            >
              <FaFileCode />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === "components" ? (
              <ComponentsSidebar />
            ) : (
              <RightSidebar />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
