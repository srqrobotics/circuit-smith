import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line, Group, Image } from "react-konva";
import Konva from "konva";
import type { Wire, DroppedComponent } from "~/types/circuit";
import {
  ComponentLoader,
  findPath,
  shiftOverlappingPaths,
} from "~/utils/componentLoader";
import { preloadImage } from "~/utils/imageLoader";
import { useCoordinates } from "~/contexts/CoordinateContext";
import { useAutoRouting } from "~/contexts/AutoRoutingContext";
import { useCanvasRefresh } from "~/contexts/CanvasRefreshContext";
import { useRightSidebar } from "~/contexts/RightSidebarContext";
import { useFile } from "~/contexts/FileContext";
import { useComponents } from "~/contexts/ComponentContext";
import { useCanvasState } from "~/contexts/CanvasStateContext";
import { project } from "~/api/project";
import { useProject } from "~/contexts/ProjectContext"; // <-- added

export default function Canvas() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const stageRef = useRef<any>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const { setCoordinates } = useCoordinates();
  const { autoRoutingEnabled } = useAutoRouting();
  const [hoveredComponentName, setHoveredComponentName] = useState<
    string | null
  >(null);
  const [isDraggingWires, setIsDraggingWires] = useState(false);
  const routingInProgress = useRef(false);
  const componentsRef = useRef<DroppedComponent[]>([]);
  // Track if we've already done the initial blank setup for a new project
  const hasInitializedNewProjectRef = useRef(false);
  const previousProjectIdRef = useRef<string | null>(null);
  const { refreshTrigger } = useCanvasRefresh();
  const { sidebarState, setCode } = useRightSidebar();
  const currentProjectId = sidebarState.currentProjectId;
  const isNewProject = sidebarState.isNewProject;
  const generatedConfig = sidebarState.generatedConfig;

  const positionTracker = useRef({
    x: 100,
    y: 100,
    direction: "horizontal",
    boxWidth: 100, // initial bounding box width
    boxHeight: 100, // initial bounding box height
  });

  // Debug logging for currentProjectId
  useEffect(() => {
    console.log(`Canvas: currentProjectId changed to: ${currentProjectId}`);
  }, [currentProjectId]);

  const { setSelectedFile } = useFile();
  const { selectedComponents } = useComponents();
  const {
    canvasState,
    setComponents,
    setWires,
    setConfig,
    addComponent,
    updateComponentPosition,
  } = useCanvasState();

  const { components, wires, config } = canvasState;

  // Keep componentsRef in sync with components state
  useEffect(() => {
    componentsRef.current = components;
  }, [components]);

  // Initialize canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector(
        ".flex-1.h-full.relative.overflow-hidden"
      );
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const resizeObserver = new ResizeObserver(updateDimensions);
    const container = document.querySelector(
      ".flex-1.h-full.relative.overflow-hidden"
    );
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize canvas based on project state
  useEffect(() => {
    const initializeCanvas = async () => {
      console.log("Canvas initialization:", {
        currentProjectId,
        isNewProject,
      });

      if (isNewProject) {
        // Only clear once for a brand-new project
        if (!hasInitializedNewProjectRef.current) {
          console.log("Starting with empty canvas for new project (initial)");
          setComponents([]);
          setWires([]);
          setConfig({ components: [], wire: [] });
          setCode("");
          setSelectedFile(null);
          hasInitializedNewProjectRef.current = true;
        } else {
          console.log(
            "New project flag still true, but initialization already performed; skipping reset"
          );
        }
        return;
      }

      if (currentProjectId && currentProjectId !== "0") {
        // Load existing project
        console.log("Loading existing project with ID:", currentProjectId);
        try {
          const projectResponse =
            await project.getDataFromProjectId(currentProjectId);
          if (projectResponse.success && projectResponse.project) {
            const { jsonString, arduino_code } = projectResponse.project;

            if (jsonString) {
              // Parse the JSON string to get wiring data
              const wiringData = JSON.parse(jsonString);
              const loadedConfig =
                await ComponentLoader.loadInitialComponentsFromData(
                  wiringData,
                  setLoadedImages,
                  setComponents,
                  setWires
                );
              setConfig(loadedConfig);
            } else {
              // Start with empty state for projects without wiring data
              console.log(
                "Project has no wiring data, starting with empty canvas"
              );
              setComponents([]);
              setWires([]);
              setConfig({ components: [], wire: [] });
            }

            // Handle code data
            if (arduino_code) {
              console.log("[Canvas] Loaded Arduino code from DB, length:", arduino_code.length);
              setCode(arduino_code, false); // Do not mark as unsaved when loading from DB
            } else {
              console.log("[Canvas] No Arduino code found in DB");
              setCode("", false);
            }
          } else {
            console.error(
              "Failed to load project:",
              projectResponse.message || "Unknown error"
            );
            setComponents([]);
            setWires([]);
            setConfig({ components: [], wire: [] });
            setCode("");
            setSelectedFile(null);
          }
        } catch (error) {
          console.error("Error loading project data:", error);
          setComponents([]);
          setWires([]);
          setConfig({ components: [], wire: [] });
          setCode("");
          setSelectedFile(null);
        }
      } else {
        // No project ID - start with empty canvas
        console.log("No project ID, starting with empty canvas");
        setComponents([]);
        setWires([]);
        setConfig({ components: [], wire: [] });
      }
    };

    // Only initialize when we have the project information
    if (currentProjectId !== null || isNewProject) {
      initializeCanvas();
    }
  }, [currentProjectId, isNewProject]);

  // Reload configuration when refreshTrigger changes
  useEffect(() => {
    const reloadConfiguration = async () => {
      try {
        console.log("Reloading configuration due to refresh trigger");

        // Only reload if we don't have components on canvas
        // This prevents replacing user-added components
        if (components.length === 0) {
          if (isNewProject) {
            // New project - keep empty canvas
            console.log("New project, keeping empty canvas");
            setComponents([]);
            setWires([]);
            setConfig({ components: [], wire: [] });
          } else if (currentProjectId && currentProjectId !== "0") {
            // Load existing project
            const loadedConfig = await ComponentLoader.loadInitialComponents(
              setLoadedImages,
              setComponents,
              setWires,
              currentProjectId
            );
            setConfig(loadedConfig);
          } else {
            // No project ID, start with empty canvas
            console.log("No project ID, starting with empty canvas");
            setComponents([]);
            setWires([]);
            setConfig({ components: [], wire: [] });
          }
        } else {
          console.log(
            "Canvas has components, skipping reload to preserve user state"
          );
        }

        // If auto-routing is enabled, start routing with the new configuration
        if (autoRoutingEnabled) {
          startRouting();
        }
      } catch (error) {
        console.error("Error reloading configuration:", error);
      }
    };

    if (refreshTrigger > 0) {
      reloadConfiguration();
    }
  }, [
    refreshTrigger,
    autoRoutingEnabled,
    components.length,
    currentProjectId,
    isNewProject,
  ]);

  // Update wiring when generated config changes (from wiring generation)
  useEffect(() => {
    const updateWiringFromGeneratedConfig = async () => {
      if (!generatedConfig) {
        console.log("No generated config to apply");
        return;
      }

      try {
        const wiringData = JSON.parse(generatedConfig);
        console.log("Updating wiring from generated config:", wiringData);

        // Only update wiring if we have components on the canvas
        if (components.length === 0) {
          console.log("No components on canvas, skipping wiring update");
          return;
        }

        // Update the config with the new wiring data
        setConfig(wiringData);

        // Use the new function to load components from canvas state
        await ComponentLoader.loadComponentsFromCanvas(
          components,
          wiringData,
          setLoadedImages,
          setWires
        );

        console.log("Successfully updated wiring from canvas components");
      } catch (error) {
        console.error("Error parsing generated config:", error);
      }
    };

    // Only update wiring if we have generated config and components on canvas
    if (generatedConfig && components.length > 0) {
      updateWiringFromGeneratedConfig();
    }
  }, [generatedConfig, components.length]);

  // Reload configuration when project ID changes
  useEffect(() => {
    const reloadForProjectChange = async () => {
      console.log("Project ID change effect:", {
        previousProjectId: previousProjectIdRef.current,
        currentProjectId,
        isNewProject,
        componentsLength: components.length,
      });

      // Skip if project id hasn't actually changed
      if (previousProjectIdRef.current === currentProjectId) {
        return;
      }

      // Update previous project id for next change detection
      previousProjectIdRef.current = currentProjectId;

      if (isNewProject) {
        // For new project after initial setup we do NOT clear again
        console.log(
          "Detected project id recorded for new project; canvas state preserved"
        );
        return;
      }

      if (currentProjectId && currentProjectId !== "0") {
        console.log(
          `Project ID changed to ${currentProjectId}, checking if reload is needed`
        );

        // Only reload if we don't have components on canvas
        // This prevents replacing user-added components when project ID changes
        if (components.length === 0) {
          try {
            const loadedConfig = await ComponentLoader.loadInitialComponents(
              setLoadedImages,
              setComponents,
              setWires,
              currentProjectId
            );
            setConfig(loadedConfig);

            if (autoRoutingEnabled) {
              startRouting();
            }
          } catch (error) {
            console.error(
              "Error reloading configuration for project change:",
              error
            );
          }
        } else {
          console.log(
            "Canvas has components, skipping reload to preserve user state"
          );
        }
      } else {
        console.log("No valid project ID, starting with empty canvas");
        setComponents([]);
        setWires([]);
        setConfig({ components: [], wire: [] });
      }
    };

    // Only run if we have some project context (including null->id transitions)
    if (currentProjectId !== undefined) {
      reloadForProjectChange();
    }
  }, [currentProjectId, isNewProject, components.length, autoRoutingEnabled]);

  // Handle keyboard events for Shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftPressed(false);
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

  const handleDragStart = () => {
    setIsDraggingComponent(true);
    setIsDraggingWires(true);
    setWires([]);
  };

  const handleDragEnd = async (e: any) => {
    if (isDraggingComponent) {
      const pos = {
        x: Math.round(e.target.x()),
        y: Math.round(e.target.y()),
      };

      const draggedComponent = components.find(
        (c) => c.name === hoveredComponentName
      );

      if (draggedComponent) {
        // Update the component's position in state
        updateComponentPosition(draggedComponent.id, pos.x, pos.y);

        // Update the component position in the configuration
        await ComponentLoader.updateComponentPosition(
          draggedComponent.id,
          pos.x,
          pos.y
        );

        // Only recalculate routing if auto-routing is enabled
        if (autoRoutingEnabled) {
          // Wait for the component state to be updated
          await new Promise((resolve) => setTimeout(resolve, 0));

          // Force a complete re-routing of all components
          await startRouting();
        } else {
          // Even without auto-routing, save the visual state when components are moved
          const updatedComponents = components.map((c) =>
            c.id === draggedComponent.id ? { ...c, x: pos.x, y: pos.y } : c
          );
          await saveVisualState(updatedComponents, wires);
        }
      }
    }

    setIsDraggingComponent(false);
    setIsDraggingWires(false);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const position = stage.getPointerPosition();
    if (!position) return;

    const scaledPosition = {
      x: Math.round((position.x - stage.x()) / scale),
      y: Math.round((position.y - stage.y()) / scale),
    };
    setCoordinates(scaledPosition);

    const hoveredComponent = components.find(
      (component) =>
        scaledPosition.x >= component.x &&
        scaledPosition.x <= component.x + component.image.width &&
        scaledPosition.y >= component.y &&
        scaledPosition.y <= component.y + component.image.height
    );

    setHoveredComponentName(hoveredComponent ? hoveredComponent.name : null);
  };

  // Handle drag and drop from sidebar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const componentData = JSON.parse(e.dataTransfer.getData("component"));
      if (!componentData || !componentData.id) {
        console.error("Invalid component data received");
        return;
      }

      // Get drop position relative to canvas
      const stage = stageRef.current;
      if (!stage) return;

      const rect = stage.container().getBoundingClientRect();
      // const x = (e.clientX - rect.left - stage.x()) / scale;
      // const y = (e.clientY - rect.top - stage.y()) / scale;

      // Add component to canvas
      await addComponentToCanvas(componentData.id);
    } catch (error) {
      console.error("Error handling component drop:", error);
    }
  };

  // Add new component to canvas
  const updateNextComponentPosition = (imageWidth: number, imageHeight: number) => {
    const padding = 30;

    if (positionTracker.current.direction === "vertical") {
      positionTracker.current.y += imageHeight + padding;
    } else {
      positionTracker.current.x += imageWidth + padding;
    }

    // Toggle direction
    positionTracker.current.direction = (positionTracker.current.direction === "vertical") ? "horizontal" : "vertical";
  };


  const addComponentToCanvas = async (componentId: string) => {
    try {
      const componentData = await loadComponentData(componentId);
      if (!componentData) {
        console.error(`Component data not found for ${componentId}`);
        return;
      }

      const newComponent: DroppedComponent = {
        id: componentId,
        name: componentData.name,
        x: positionTracker.current.x,
        y: positionTracker.current.y,
        rotation: 0,
        image: {
          src:
            componentData.image?.src || `./packages/${componentId}/image.png`,
          width: componentData.image?.width || 50,
          height: componentData.image?.height || 50,
        },
        pinMap: undefined,
      };

      // Load image
      const img = await preloadImage(newComponent.image.src);
      newComponent.image.width = img.naturalWidth;
      newComponent.image.height = img.naturalHeight;

      // Optional pin map
      if (componentData["pin-map"]?.src) {
        try {
          const pinMapResponse = await fetch(componentData["pin-map"].src);
          (newComponent as any).pinMap = await pinMapResponse.json();
        } catch (error) {
          console.warn(`Failed to load pin map for ${componentId}:`, error);
        }
      }

      // Add to state
      setLoadedImages((prev) => ({
        ...prev,
        [newComponent.image.src]: img,
      }));

      addComponent(newComponent);

      updateNextComponentPosition(newComponent.image.width, newComponent.image.height);

      await saveVisualState([...components, newComponent], wires);

      // 🧠 Update position for next component
      // Update position for next component

      console.log(
        `Placed ${componentId} at (${newComponent.x}, ${newComponent.y})`
      );
    } catch (error) {
      console.error(`Error adding component ${componentId}:`, error);
    }
  };

  // Load component data from packages
  const loadComponentData = async (componentId: string): Promise<any> => {
    try {
      // Try to load from devBible.json first
      const devBibleResponse = await fetch("./packages/devBible.json");
      if (devBibleResponse.ok) {
        const devBibleData = await devBibleResponse.json();
        const component = devBibleData.components?.find(
          (c: any) => c.id === componentId
        );
        if (component) return component;
      }

      // If not found, try sensorBible.json
      const sensorBibleResponse = await fetch("./packages/sensorBible.json");
      if (sensorBibleResponse.ok) {
        const sensorBibleData = await sensorBibleResponse.json();
        const component = sensorBibleData.components?.find(
          (c: any) => c.id === componentId
        );
        if (component) return component;
      }

      return null;
    } catch (error) {
      console.error(`Error loading component data for ${componentId}:`, error);
      return null;
    }
  };

  // Save visual state to project folder
  const saveVisualState = async (
    components: DroppedComponent[],
    wires: Wire[]
  ) => {
    if (!currentProjectId || currentProjectId === "0") {
      console.log("No project ID available, skipping visual state save");
      return;
    }

    try {
      const visualState = {
        components: components.map((comp) => ({
          id: comp.id,
          name: comp.name,
          x: comp.x,
          y: comp.y,
          image: {
            src: comp.image.src,
            width: comp.image.width,
            height: comp.image.height,
          },
        })),
        wires: wires.map((wire) => ({
          points: wire.points,
          color: wire.color,
        })),
        timestamp: new Date().toISOString(),
      };

      const BASE_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${BASE_URL}/api/save-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          file: "visual.json",
          content: visualState,
          projectId: currentProjectId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(
        `Successfully saved visual state to projects/${currentProjectId}/visual.json`,
        result
      );
    } catch (error) {
      console.error("Error saving visual state:", error);
    }
  };

  const startRouting = async () => {
    // Prevent multiple routing operations from running simultaneously
    if (routingInProgress.current) {
      console.log("Routing already in progress, skipping...");
      return;
    }

    if (!config) {
      console.error("Config is not loaded yet.");
      return;
    }

    routingInProgress.current = true;
    ComponentLoader.colorIndex = 0;

    try {
      // Get the current component positions from the ref
      const currentComponents = componentsRef.current;
      console.log(
        "Starting routing with current components:",
        currentComponents
      );

      // Clear any existing wires
      setWires([]);

      // Create a new array for wire connections
      const compWiring: Wire[] = [];

      // Get device bounds for path finding using current component positions
      const bounds = ComponentLoader.getDeviceBounds(currentComponents);

      // Process wire connections with the current component positions
      await ComponentLoader.processWireConnections(
        config,
        currentComponents,
        compWiring,
        setComponents
      );

      // Process each wire to find valid paths around components
      compWiring.forEach((wire) => {
        if (wire.points.length >= 6) {
          const [startX, startY] = [wire.points[2], wire.points[3]];
          const [endX, endY] = [wire.points[4], wire.points[5]];
          const path = findPath([startX, startY], [endX, endY], bounds);
          if (path.length > 0) {
            const wirePath = path.flat();
            wire.points.splice(wire.points.length - 4, 0, ...wirePath);
          }
        }
      });

      // Shift overlapping paths
      const newWiring = shiftOverlappingPaths(compWiring, bounds);
      const finalWires = shiftOverlappingPaths(newWiring, bounds);

      console.log("Routing complete, setting wires:", finalWires);
      setWires(finalWires);

      // Save visual state after routing is complete
      await saveVisualState(currentComponents, finalWires);
    } catch (error) {
      console.error("Error during routing:", error);
    } finally {
      routingInProgress.current = false;
    }
  };

  // Add a useEffect to handle auto-routing state changes
  useEffect(() => {
    if (autoRoutingEnabled) {
      console.log("Auto-routing enabled, starting routing...");
      startRouting();
    } else {
      console.log("Auto-routing disabled, clearing wires...");
      setWires([]);
    }
  }, [autoRoutingEnabled]);

  // Add components to canvas when they are selected in sidebar
  useEffect(() => {
    const addSelectedComponents = async () => {
      if (selectedComponents.length === 0) return;

      // Find components that are selected but not yet on canvas
      const componentsOnCanvas = components.map((comp) => comp.id);
      const newComponents = selectedComponents.filter(
        (id) => !componentsOnCanvas.includes(id)
      );

      if (newComponents.length > 0) {
        console.log("Adding new components to canvas:", newComponents);

        // Add each new component at a default position (spread them out)
        for (let i = 0; i < newComponents.length; i++) {
          const componentId = newComponents[i];
          await addComponentToCanvas(componentId);
        }
      }
    };

    addSelectedComponents();
  }, [selectedComponents]);

  return (
    <div
      className="w-full h-full bg-gray-50 dark:bg-gray-800"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        draggable={!isDraggingComponent}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        ref={stageRef}
      >
        {/* Origin Cross Layer: Draw a 100x100px cross at the origin */}
        <Layer listening={false}>
          {/* Vertical line of the cross */}
          <Line
            points={[-50, 0, 50, 0]}
            stroke={'#888'}
            strokeWidth={2}
          />
          {/* Horizontal line of the cross */}
          <Line
            points={[0, -50, 0, 50]}
            stroke={'#888'}
            strokeWidth={2}
          />
        </Layer>
        <Layer>
          {/* Render components */}
          {components.map((component) => (
            <Group
              key={component.id}
              x={component.x}
              y={component.y}
              draggable={isShiftPressed}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Image
                image={loadedImages[component.image.src]}
                width={component.image.width}
                height={component.image.height}
              />
            </Group>
          ))}

          {/* Render wires - using straight lines instead of curved ones */}
          {!isDraggingWires &&
            wires.map((wire, i) => (
              <Line
                key={i}
                points={wire.points}
                stroke={wire.color}
                strokeWidth={2}
                tension={0} // Set tension to 0 for straight lines
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
}
