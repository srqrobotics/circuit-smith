import React from "react";

interface ComponentItemProps {
  name: string;
  icon: string;
  onDragStart: (e: React.DragEvent) => void;
}

export default function ComponentItem({
  name,
  icon,
  onDragStart,
}: ComponentItemProps) {
  return (
    <div
      className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-gray-200 dark:border-gray-600"
      draggable
      onDragStart={onDragStart}
    >
      <img src={icon} alt={name} className="w-12 h-12 object-contain mb-2" />
      <span className="text-xs text-center text-gray-600 dark:text-gray-300">
        {name}
      </span>
    </div>
  );
}
