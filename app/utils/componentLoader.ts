import { preloadImage } from './imageLoader';
import type { DroppedComponent, Wire } from '~/types/circuit';

interface PinMapData {
  'digital-pins': {
    id: string[];
    reloc: { id: string; points: number[] }[];
  };
}

export class ComponentLoader {
  static locatePins(component: any): Wire[] {
    const pinPoints: Wire[] = [];
    
    if (!component['pin-map']?.src) return pinPoints;

    try {
      const pinMapData: PinMapData = component.pinMap;
      
      pinMapData['digital-pins'].id.forEach((pinId: string) => {
        const pinData = pinMapData['digital-pins'].reloc.find(
          (pin) => pin.id === pinId
        );
        
        if (pinData) {
          const x = pinData.points[0] + component.x;
          const y = pinData.points[1] + component.y;
          pinPoints.push({
            id: pinId,
            points: [x, y, x, y],
            color: "#ff0000"
          });
        }
      });
    } catch (error) {
      document.dispatchEvent(new CustomEvent('console-output', { 
        detail: { type: 'error', message: `Failed to generate pin wires: ${error}` }
      }));
    }

    return pinPoints;
  }

  static async loadInitialComponents(
    setLoadedImages: React.Dispatch<React.SetStateAction<{ [key: string]: HTMLImageElement }>>,
    setComponents: React.Dispatch<React.SetStateAction<DroppedComponent[]>>,
    setWires: React.Dispatch<React.SetStateAction<Wire[]>>
  ) {
    try {
      const response = await fetch('/configs/demo.json');
      const config = await response.json();

      // Load pin mappings
      const pinWirePromises = config.components.map(async (component: any) => {
        if (component['pin-map']?.src) {
          const pinMapResponse = await fetch(component['pin-map'].src);
          component.pinMap = await pinMapResponse.json();
          return ComponentLoader.locatePins(component);
        }
        return [];
      });

      // Load images
      const imageLoadPromises = config.components.map(async (component: DroppedComponent) => {
        const img = await preloadImage(component.image.src);
        component.image.width = img.naturalWidth;
        component.image.height = img.naturalHeight;
        return { src: component.image.src, img };
      });

      // Wait for all promises to resolve
      const [pinWires, loadedImgs] = await Promise.all([
        Promise.all(pinWirePromises),
        Promise.all(imageLoadPromises)
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

      // Flatten pin wires array and set wires
      const allPinWires = pinWires.flat();
      if (allPinWires.length > 0) {
        setWires(allPinWires);
      }

    } catch (error) {
      console.error("Failed to load initial components:", error);
    }
  }
} 