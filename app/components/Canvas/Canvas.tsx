import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line, Group, Image } from "react-konva";
import { useFile } from "~/contexts/FileContext";
import type { Wire, DroppedComponent } from "~/types/circuit";
import { handleWireDrawing } from "~/utils/wireManager";
import { loadComponent, loadInitialComponents } from "~/utils/componentLoader";
import { useCoordinates } from "~/contexts/CoordinateContext";

export default function Canvas() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [components, setComponents] = useState<DroppedComponent[]>([]);
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [wires, setWires] = useState<Wire[]>([]);
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [currentWire, setCurrentWire] = useState<number[]>([]);
  const [wireColor, setWireColor] = useState("#ff0000"); // Default red wire
  const stageRef = useRef<any>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { setCoordinates } = useCoordinates();

  useEffect(() => {
    setIsMounted(true);
    const updateDimensions = () => {
      const container = document.getElementById("canvas-container");
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    loadInitialComponents(setLoadedImages, setComponents, setWires);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const stage = e.currentTarget.getElementsByTagName("canvas")[0];
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const componentData = JSON.parse(e.dataTransfer.getData("component"));

    const stageP = {
      x: (e.clientX - stageRect.left - position.x) / scale,
      y: (e.clientY - stageRect.top - position.y) / scale,
    };

    await loadComponent(
      componentData,
      stageP,
      scale,
      loadedImages,
      setLoadedImages,
      setComponents
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const gridSize = 20;
  const numLinesX = Math.ceil(dimensions.width / gridSize);
  const numLinesY = Math.ceil(dimensions.height / gridSize);

  const wireDrawingHandlers = handleWireDrawing(
    isDrawingWire,
    currentWire,
    wireColor,
    setWires,
    setIsDrawingWire,
    setCurrentWire,
    () => {
      const stage = stageRef.current;
      return stage ? stage.getPointerPosition() : { x: 0, y: 0 };
    }
  );

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const position = stage.getPointerPosition();
    const scaledPosition = {
      x: Math.round((position.x - stage.x()) / scale),
      y: Math.round((position.y - stage.y()) / scale),
    };
    setMousePosition(scaledPosition);
    setCoordinates(scaledPosition);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 bg-white dark:bg-gray-800">
        <Toolbar wireColor={wireColor} onWireColorChange={setWireColor} />
      </div>
      <div
        id="canvas-container"
        className="flex-1 relative bg-white dark:bg-gray-800"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isMounted && (
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={isCtrlPressed && !isDraggingComponent}
            onWheel={handleWheel}
            onDragEnd={handleDragEnd}
            onMouseMove={handleMouseMove}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                wireDrawingHandlers.startDrawing(e);
              }
            }}
            onMouseUp={wireDrawingHandlers.finishDrawing}
          >
            <Layer>
              <Group>
                {/* Grid lines */}
                {Array.from({ length: 50 }, (_, i) => (
                  <React.Fragment key={`grid-${i}`}>
                    <Line
                      points={[
                        i * gridSize,
                        0,
                        i * gridSize,
                        numLinesY * gridSize,
                      ]}
                      stroke={isDarkMode ? "#374151" : "#ddd"}
                      strokeWidth={0.5}
                    />
                    <Line
                      points={[
                        0,
                        i * gridSize,
                        numLinesX * gridSize,
                        i * gridSize,
                      ]}
                      stroke={isDarkMode ? "#374151" : "#ddd"}
                      strokeWidth={0.5}
                    />
                  </React.Fragment>
                ))}
                {/* Wires */}
                {wires.map((wire) => (
                  <Line
                    key={wire.id}
                    points={wire.points}
                    stroke={wire.color}
                    strokeWidth={2}
                    lineJoin="round"
                    lineCap="round"
                    cornerRadius={10}
                  />
                ))}
                {isDrawingWire && currentWire.length >= 2 && (
                  <Line
                    points={currentWire}
                    stroke={wireColor}
                    strokeWidth={2}
                    lineJoin="round"
                    lineCap="round"
                    cornerRadius={10}
                  />
                )}
                {/* Dropped Components */}
                {components.map(
                  (component) =>
                    loadedImages[component.image.src] && (
                      <Image
                        key={component.id}
                        image={loadedImages[component.image.src]}
                        x={component.x}
                        y={component.y}
                        width={component.image.width}
                        height={component.image.height}
                        rotation={component.rotation}
                        draggable
                        onDragStart={(e) => {
                          e.evt.stopPropagation();
                          setIsDraggingComponent(true);
                        }}
                        onDragEnd={(e) => {
                          e.evt.stopPropagation();
                          setIsDraggingComponent(false);
                          const pos = e.target.position();
                          setComponents((prev) =>
                            prev.map((c) =>
                              c.id === component.id
                                ? { ...c, x: pos.x, y: pos.y }
                                : c
                            )
                          );
                        }}
                        onTransform={(e) => {
                          const node = e.target;
                          setComponents((prev) =>
                            prev.map((c) =>
                              c.id === component.id
                                ? { ...c, rotation: node.rotation() }
                                : c
                            )
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "r" || e.key === "R") {
                            setComponents((prev) =>
                              prev.map((c) =>
                                c.id === component.id
                                  ? { ...c, rotation: c.rotation + 90 }
                                  : c
                              )
                            );
                          }
                        }}
                      />
                    )
                )}
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

function Toolbar({
  wireColor,
  onWireColorChange,
}: {
  wireColor: string;
  onWireColorChange: (color: string) => void;
}) {
  return (
    <>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        New Circuit
      </button>
      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm">
        Save
      </button>
      <select
        value={wireColor}
        onChange={(e) => onWireColorChange(e.target.value)}
        className="p-1.5 bg-transparent border rounded"
      >
        <option value="#ff0000">Red</option>
        <option value="#000000">Black</option>
        <option value="#0000ff">Blue</option>
        <option value="#ffff00">Yellow</option>
        <option value="#00ff00">Green</option>
      </select>
    </>
  );
}
