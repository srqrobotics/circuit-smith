import React from "react";
import { useCoordinates } from "~/contexts/CoordinateContext";

interface BottomPanelProps {
  hoveredComponentName: string | null;
}

export default function BottomPanel({
  hoveredComponentName,
}: BottomPanelProps) {
  const { coordinates } = useCoordinates();

  return (
    <div className="h-32 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-8 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Console Output
        </h2>
      </div>
      <div className="p-2 font-mono text-xs overflow-auto h-[calc(100%-2rem)]">
        <div className="text-gray-600 dark:text-gray-400">
          Mouse Position - X: {coordinates.x}, Y: {coordinates.y}
        </div>
        {hoveredComponentName && (
          <div className="text-gray-600 dark:text-gray-400">
            Component ID: {hoveredComponentName}
          </div>
        )}
      </div>
    </div>
  );
}
