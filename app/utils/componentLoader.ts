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

export class ComponentLoader {
  private static colorIndex = 0;

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
        // TODO: Optimize this whole thing
        Object.keys(config.wire).forEach((key) => {
          const connection = config.wire[key];

          const wireRoute: number[] = [];
          const wireNames: { [key: string]: string } = {};

          Object.keys(connection).forEach((device) => {
            const pin = connection[device];
            console.log(device, pin);

            const pinMap = config.components.find(
              (comp: DroppedComponent) => comp.id === device
            ).pinMap["digital-pins"]["reloc"];

            const componentLocation = config.components.find(
              (comp: DroppedComponent) => comp.id === device
            );

            // Find matching pin id in pinMap array
            const compHeight = componentLocation.image.height;
            const compWidth = componentLocation.image.width;
            const matchingPin = pinMap.find((p: any) => p.id === pin);

            if (matchingPin) {
              wireNames[key] = pin;
              wireRoute.push(matchingPin.points[0] + componentLocation.x);
              wireRoute.push(matchingPin.points[1] + componentLocation.y);
            }
            // TODO: push what ever the points to make the route smooth..
          });
          // console.log("wireRoute: ", wireRoute);
          // const lastX = wireRoute[wireRoute.length - 2];
          // const lastY = wireRoute[wireRoute.length - 1];
          // wireRoute.splice(wireRoute.length - 2, 0, lastX, lastY + 20);
          // wireRoute.push(lastX - 10, lastY);

          compWiring.push({
            id: `wire-${key}`,
            points: wireRoute,
            color: ComponentLoader.getWireColor(wireNames[key]),
          });
        });

        // console.log(compWiring);
      }

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
