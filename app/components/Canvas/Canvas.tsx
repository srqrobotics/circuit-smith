import React, { useEffect, useState } from 'react';
import { Stage, Layer, Line, Group } from 'react-konva';

export default function Canvas() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
    const updateDimensions = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);
  };

  const handleDragEnd = (e: any) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const renderGridLines = () => {
    const gridSize = 20;
    const lines = [];
    const numLinesX = Math.ceil(dimensions.width / (gridSize * scale));
    const numLinesY = Math.ceil(dimensions.height / (gridSize * scale));

    for (let i = 0; i <= numLinesX; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize * scale, 0, i * gridSize * scale, numLinesY * gridSize * scale]}
          stroke={isDarkMode ? '#374151' : '#ddd'}
          strokeWidth={0.5}
        />
      );
    }

    for (let i = 0; i <= numLinesY; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize * scale, numLinesX * gridSize * scale, i * gridSize * scale]}
          stroke={isDarkMode ? '#374151' : '#ddd'}
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 bg-white dark:bg-gray-800">
        <Toolbar />
      </div>
      <div id="canvas-container" className="flex-1 relative bg-white dark:bg-gray-800">
        {isMounted && (
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable
            onWheel={handleWheel}
            onDragEnd={handleDragEnd}
          >
            <Layer>
              <Group>
                {renderGridLines()}
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

function Toolbar() {
  return (
    <>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        New Circuit
      </button>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        Save
      </button>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        Zoom In
      </button>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        Zoom Out
      </button>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        Start Simulation
      </button>
    </>
  );
} 