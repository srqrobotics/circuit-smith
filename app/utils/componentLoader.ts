import { preloadImage } from "./imageLoader";
import type { DroppedComponent, Wire } from "~/types/circuit";

interface PinMapData {
  "digital-pins": {
    id: string[];
    reloc: { id: string; points: number[] }[];
  };
}

export const wireColor = {
  red: "#ff0000",
  black: "#000000",
  blue: "#0000ff",
  orange: "#ffa500",
  green: "#00ff00",
  brown: "#8b4513",
  gray: "#808080",
  white: "#ffffff",
  yellow: "#ffff00",
  violet: "#8a2be2",
  rose: "#ff007f",
  aqua: "#00ffff",
} as const;

export function findPath(
  start: [number, number],
  end: [number, number],
  bounds: number[][]
): [number, number][] {
  // Check if path is blocked by any bounds
  function isBlocked(x: number, y: number): boolean {
    return bounds.some(([x1, y1, x2, y2]) => {
      return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    });
  }

  // Check if line segment intersects with any bounds
  function intersectsBounds(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): boolean {
    if (x1 === x2) {
      // Vertical line
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let y = minY; y <= maxY; y++) {
        if (isBlocked(x1, y)) return true;
      }
    } else {
      // Horizontal line
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX; x <= maxX; x++) {
        if (isBlocked(x, y1)) return true;
      }
    }
    return false;
  }

  // Try direct path first (L shape)
  const [x1, y1] = start;
  const [x2, y2] = end;

  // Try horizontal first, then vertical
  if (!intersectsBounds(x1, y1, x2, y1) && !intersectsBounds(x2, y1, x2, y2)) {
    return [start, [x2, y1], end];
  }

  // Try vertical first, then horizontal
  if (!intersectsBounds(x1, y1, x1, y2) && !intersectsBounds(x1, y2, x2, y2)) {
    return [start, [x1, y2], end];
  }

  // If L-shape paths are blocked, try adding an additional segment (Z shape)
  const midX = (x1 + x2) / 2;
  if (
    !intersectsBounds(x1, y1, midX, y1) &&
    !intersectsBounds(midX, y1, midX, y2) &&
    !intersectsBounds(midX, y2, x2, y2)
  ) {
    return [start, [midX, y1], [midX, y2], end];
  }

  const midY = (y1 + y2) / 2;
  if (
    !intersectsBounds(x1, y1, x1, midY) &&
    !intersectsBounds(x1, midY, x2, midY) &&
    !intersectsBounds(x2, midY, x2, y2)
  ) {
    return [start, [x1, midY], [x2, midY], end];
  }

  // If no path found, return empty array
  return [];
}

export class ComponentLoader {
  private static colorIndex = 0;

  static getDeviceBounds(components: DroppedComponent[]): number[][] {
    const bounds: number[][] = [];
    components.forEach((component: DroppedComponent) => {
      const componentBounds = [
        component.x,
        component.y,
        component.x + component.image.width,
        component.y + component.image.height,
      ];
      bounds.push(componentBounds);
    });
    return bounds;
  }

  static locatePins(component: any): Wire[] {
    const pinPoints: Wire[] = [];

    if (!component["pin-map"]?.src) return pinPoints;

    try {
      const pinMapData: PinMapData = component.pinMap;

      pinMapData["digital-pins"].id.forEach((pinId: string, index: number) => {
        const pinData = pinMapData["digital-pins"].reloc.find(
          (pin: { id: string; points: number[] }) => pin.id === pinId
        );

        if (pinData) {
          const x = pinData.points[0] + component.x;
          const y = pinData.points[1] + component.y;
          pinPoints.push({
            id: `${component.id}-${pinId}`,
            points: [x, y, x, y],
            color: "#00ff00",
          });
        }
      });
    } catch (error) {
      document.dispatchEvent(
        new CustomEvent("console-output", {
          detail: {
            type: "error",
            message: `Failed to generate pin wires: ${error}`,
          },
        })
      );
    }

    return pinPoints;
  }

  static getWireColor(wireType: string): string {
    let color: string;
    switch (wireType) {
      case "5V":
        color = wireColor.red;
        break;
      case "GND":
        color = wireColor.black;
        break;
      default:
        const availableColors = Object.entries(wireColor)
          .filter(([key]) => key !== "red" && key !== "black")
          .map(([_, value]) => value);
        color =
          availableColors[
            (this.colorIndex =
              ((this.colorIndex || 0) + 1) % availableColors.length)
          ];
    }

    return `${color}`;
  }

  static getShortPathDir(
    pinLoc: number[],
    compSize: number[],
    compLoc: number[]
  ): number[] {
    const x_origin = compLoc[0];
    const x_limit = compSize[0] + x_origin;
    const x_pin = pinLoc[0];
    const y_origin = compLoc[1];
    const y_limit = compSize[1] + y_origin;
    const y_pin = pinLoc[1];

    let shortest_x = 0;
    let shortest_y = 0;

    // Pin is between bounds, find shorter distance to either edge
    const dist_to_left = Math.abs(x_pin - x_origin);
    const dist_to_right = Math.abs(x_limit - x_pin);
    shortest_x = dist_to_left <= dist_to_right ? -dist_to_left : dist_to_right;

    // Pin is between bounds, find shorter distance to either edge
    const dist_to_top = Math.abs(y_pin - y_origin);
    const dist_to_bottom = Math.abs(y_limit - y_pin);
    shortest_y = dist_to_top <= dist_to_bottom ? -dist_to_top : dist_to_bottom;

    const short_logic = Math.abs(shortest_x) <= Math.abs(shortest_y);
    const dirX = shortest_x / Math.abs(shortest_x);
    const dirY = shortest_y / Math.abs(shortest_y);
    shortest_x = short_logic ? shortest_x + 10 * dirX : 0;
    shortest_y = !short_logic ? shortest_y + 10 * dirY : 0;

    return [shortest_x, shortest_y];
  }

  static processDeviceConnections = (
    device: string,
    connection: any,
    config: any,
    key: string,
    wireRoute: number[],
    wireNames: { [key: string]: string }
  ) => {
    const pin = connection[device];

    const pinMap = config.components.find(
      (comp: DroppedComponent) => comp.id === device
    ).pinMap["digital-pins"]["reloc"];

    const component = config.components.find(
      (comp: DroppedComponent) => comp.id === device
    );

    const componentSize = [component.image.width, component.image.height];
    const matchingPin = pinMap.find((p: any) => p.id === pin);

    if (matchingPin) {
      wireNames[key] = pin;
      const x = matchingPin.points[0] + component.x;
      const y = matchingPin.points[1] + component.y;
      wireRoute.push(x);
      wireRoute.push(y);
      const shortPath = ComponentLoader.getShortPathDir([x, y], componentSize, [
        component.x,
        component.y,
      ]);

      if (wireRoute.length >= 4) {
        wireRoute.splice(
          wireRoute.length - 2,
          0,
          x + shortPath[0],
          y + shortPath[1]
        );
      } else {
        wireRoute.push(x + shortPath[0]);
        wireRoute.push(y + shortPath[1]);
      }
    }
  };

  static processWireConnections = (config: any, compWiring: Wire[]) => {
    Object.keys(config.wire).forEach((key) => {
      const connection = config.wire[key];

      const wireRoute: number[] = [];
      const wireNames: { [key: string]: string } = {};

      Object.keys(connection).forEach((device) => {
        ComponentLoader.processDeviceConnections(
          device,
          connection,
          config,
          key,
          wireRoute,
          wireNames
        );
      });

      console.log("wireRoute: ", wireRoute);

      compWiring.push({
        id: `wire-${key}`,
        points: wireRoute,
        color: ComponentLoader.getWireColor(wireNames[key]),
      });
    });
  };

  static async loadInitialComponents(
    setLoadedImages: React.Dispatch<
      React.SetStateAction<{ [key: string]: HTMLImageElement }>
    >,
    setComponents: React.Dispatch<React.SetStateAction<DroppedComponent[]>>,
    setWires: React.Dispatch<React.SetStateAction<Wire[]>>
  ) {
    try {
      const response = await fetch("/configs/demo.json");
      const config = await response.json();

      // Load pin mappings
      const pinWirePromises = config.components.map(async (component: any) => {
        if (component["pin-map"]?.src) {
          const pinMapResponse = await fetch(component["pin-map"].src);
          component.pinMap = await pinMapResponse.json();
          return ComponentLoader.locatePins(component);
        }
        return [];
      });

      // Load images
      const imageLoadPromises = config.components.map(
        async (component: DroppedComponent) => {
          const img = await preloadImage(component.image.src);
          component.image.width = img.naturalWidth;
          component.image.height = img.naturalHeight;
          return { src: component.image.src, img };
        }
      );

      // Wait for all promises to resolve
      const [pinWires, loadedImgs] = await Promise.all([
        Promise.all(pinWirePromises),
        Promise.all(imageLoadPromises),
      ]);

      // Update states
      setLoadedImages((prev) => {
        const newImages = { ...prev };
        loadedImgs.forEach(({ src, img }) => {
          newImages[src] = img;
        });
        return newImages;
      });

      setComponents(config.components);

      // Process wire configurations from config
      console.log("loading wireConnections");
      const compWiring: Wire[] = [];

      if (config.wire) {
        ComponentLoader.processWireConnections(config, compWiring);
        console.log("compWiring: ", compWiring);
      }

      if (config.components) {
        const deviceBounds = ComponentLoader.getDeviceBounds(config.components);
        console.log("deviceBounds: ", deviceBounds);

        // Process each wire to find valid paths around components
        compWiring.forEach((wire) => {
          const [startX, startY] = [wire.points[2], wire.points[3]];
          const [endX, endY] = [wire.points[4], wire.points[5]];
          const path = findPath([startX, startY], [endX, endY], deviceBounds);
          if (path.length > 0) {
            // Update wire points with the found path
            const wirePath = path.flat();
            // wirePath.splice(0, 2);
            // wirePath.splice(-2, 2);
            wirePath.forEach((point) => {
              wire.points.splice(wire.points.length - 4, 0, point);
            });
          }
          console.log(wire.points);
        });
      }

      // findPath(
      //   start: [number, number],
      //   end: [number, number],
      //   bounds: number[][]
      // );

      // Flatten pin wires array and set wires
      const allPinWires = [...compWiring.flat(), ...pinWires.flat()];
      if (allPinWires.length > 0) {
        // setWires(compWiring.flat());
        setWires(allPinWires);
      }
    } catch (error) {
      console.error("Failed to load initial components:", error);
    }
  }
}
