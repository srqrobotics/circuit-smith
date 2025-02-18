import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line, Group, Image, Text } from "react-konva";
import Konva from "konva";
import { useFile } from "~/contexts/FileContext";
import type { Wire, DroppedComponent } from "~/types/circuit";
import { handleWireDrawing } from "~/utils/wireManager";
import {
  ComponentLoader,
  findPath,
  shiftOverlappingPaths,
} from "~/utils/componentLoader";
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
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [config, setConfig] = useState<any>(null); // State variable for config
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(
    null
  ); // New state for dragged component ID

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

    // Load initial components without routing
    ComponentLoader.loadInitialComponents(
      setLoadedImages,
      setComponents,
      setWires // This should only set the wires if needed, not for routing
    )
      .then((loadedConfig) => {
        setConfig(loadedConfig); // Set the config state
      })
      .catch((error) => {
        console.error("Error loading components:", error);
      });

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

  const handleDragStart = (e: any) => {
    setIsDraggingComponent(true);
    const componentId = e.target.id(); // Get the ID of the dragged component
    setDraggedComponentId(componentId); // Store the ID of the dragged component
    console.log("Dragging Component ID:", componentId); // Log the ID
  };

  const handleDragEnd = async (e: any) => {
    if (e.target === e.target.getStage() && !isDraggingComponent) {
      const pos = {
        x: e.target.x(),
        y: e.target.y(),
      };

      // Find the component being dragged using the stored ID
      const draggedComponent = components.find(
        (c) => c.id === draggedComponentId
      );
      console.log("Dragged Component ID:", draggedComponentId);
      console.log("Dragged Component:", draggedComponent);

      if (draggedComponent) {
        // Log the name of the dragged component
        console.log("Dragged Component Name:", draggedComponent.name); // Log the component name
        console.log("Dropped Location:", pos);

        // Update the component's position in state
        setComponents((prev) =>
          prev.map((c) =>
            c.id === draggedComponent.id ? { ...c, x: pos.x, y: pos.y } : c
          )
        );

        // Update the component position in the configuration
        await ComponentLoader.updateComponentPosition(
          draggedComponent.id,
          pos.x,
          pos.y
        );

        // Refresh the loaded components to get updated pin positions
        const updatedConfig = await ComponentLoader.loadInitialComponents(
          setLoadedImages,
          setComponents,
          setWires
        );

        // Recalculate wiring based on new pin positions
        const compWiring: Wire[] = [];
        await ComponentLoader.processWireConnections(
          updatedConfig,
          compWiring,
          setComponents
        );

        // Update the wires state with the new wiring
        setWires(compWiring);
      } else {
        console.error("No component found for the dragged ID.");
      }
    } else {
      console.log("Drag event ignored due to isDraggingComponent state.");
    }
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

    // await loadComponent(
    //   componentData,
    //   stageP,
    //   scale,
    //   loadedImages,
    //   setLoadedImages,
    //   setComponents
    // );
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

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const position = stage.getPointerPosition();
    if (!position) return;

    const scaledPosition = {
      x: Math.round((position.x - stage.x()) / scale),
      y: Math.round((position.y - stage.y()) / scale),
    };
    setMousePosition(scaledPosition);
    setCoordinates(scaledPosition);
  };

  // Route Wiring Button
  const handleRouting = async () => {
    if (!config) {
      console.error("Config is not loaded yet.");
      return; // Prevent routing if config is not available
    }

    setIsRouting(true);
    const compWiring: Wire[] = [];

    // Call the routing logic here
    await ComponentLoader.processWireConnections(
      config,
      compWiring,
      setComponents
    );

    // Retrieve the final wiring from the ComponentLoader
    // const finalWiring = ComponentLoader.getFinalWiring();

    if (config.components) {
      const deviceBounds = ComponentLoader.getDeviceBounds(config.components);
      console.log("deviceBounds: ", deviceBounds);

      // Process each wire to find valid paths around components
      compWiring.forEach((wire) => {
        const [startX, startY] = [wire.points[2], wire.points[3]];
        const [endX, endY] = [wire.points[4], wire.points[5]];
        const path = findPath([startX, startY], [endX, endY], deviceBounds);
        if (path.length > 0) {
          const wirePath = path.flat();
          wire.points.splice(wire.points.length - 4, 0, ...wirePath);
        }
        console.log(wire.points);
      });

      const newWiring = shiftOverlappingPaths(compWiring, deviceBounds);
      const finalWiring = shiftOverlappingPaths(newWiring, deviceBounds);

      // Store final wiring in the class variable
      // this.finalWiring = finalWiring;

      // Update the wires state with the new wiring
      setWires(finalWiring);
      console.log("Final Wiring: ", finalWiring); // You can use this as needed
    }

    setIsRouting(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 bg-white dark:bg-gray-800">
        <button
          onClick={handleRouting}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm"
        >
          Route Wires
        </button>
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
            draggable={!isDraggingComponent}
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

                {/* Dropped Components - Render these first */}
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
                        draggable={isCtrlPressed}
                        onDragStart={handleDragStart} // Add drag start handler
                        onDragEnd={handleDragEnd}
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
                      />
                    )
                )}

                {/* Wires with Pin Labels */}
                {wires.map((wire) => (
                  <React.Fragment key={wire.id}>
                    <Line
                      points={wire.points}
                      stroke={wire.color}
                      strokeWidth={2}
                      lineJoin="round"
                      lineCap="round"
                      cornerRadius={10}
                      onMouseEnter={() => setHoveredWireId(wire.id)}
                      onMouseLeave={() => setHoveredWireId(null)}
                    />
                    {hoveredWireId === wire.id && (
                      <Text
                        x={wire.points[0] + 5}
                        y={wire.points[1] - 5}
                        text={wire.id}
                        fontSize={8}
                        fill={wire.color}
                        fontFamily="monospace"
                      />
                    )}
                  </React.Fragment>
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
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}
