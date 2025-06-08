import React from "react";

type Position = "bottom-right" | "top-right";

interface BackgroundEllipsesProps {
  position?: Position;
}

export default function BackgroundEllipses({
  position = "bottom-right",
}: BackgroundEllipsesProps) {
  const positionClasses = {
    "bottom-right": "bottom-0 right-0",
    "top-right": "top-6 right-6",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} z-0 pointer-events-none`}
    >
      {/* First row of ellipses */}
      <div className="flex justify-end mb-3">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <div
              key={`row1-${i}`}
              className="w-2 h-2 rounded-full bg-white bg-opacity-50 mx-1"
            />
          ))}
      </div>

      {/* Second row of ellipses */}
      <div className="flex justify-end mb-6">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <div
              key={`row2-${i}`}
              className="w-2 h-2 rounded-full bg-white bg-opacity-50 mx-1"
            />
          ))}
      </div>
    </div>
  );
}
