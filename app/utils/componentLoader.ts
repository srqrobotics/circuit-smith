import { preloadImage } from './imageLoader';
import type { DroppedComponent, Wire } from '~/types/circuit';

export async function loadComponent(
  componentData: any,
  stagePosition: { x: number; y: number },
  scale: number,
  loadedImages: { [key: string]: HTMLImageElement },
  setLoadedImages: React.Dispatch<React.SetStateAction<{ [key: string]: HTMLImageElement }>>,
  setComponents: React.Dispatch<React.SetStateAction<DroppedComponent[]>>
) {
  if (!componentData.image) {
    console.log("No image data in component:", componentData);
    return;
  }

  try {
    // Load image if not already loaded
    if (!loadedImages[componentData.image.src]) {
      const img = await preloadImage(componentData.image.src);
      setLoadedImages((prev) => ({
        ...prev,
        [componentData.image.src]: img,
      }));
    }

    const newComponent: DroppedComponent = {
      id: `${componentData.id}-${Date.now()}`,
      name: componentData.name,
      x: stagePosition.x,
      y: stagePosition.y,
      rotation: 0,
      image: componentData.image,
    };

    setComponents((prev) => [...prev, newComponent]);
  } catch (error) {
    console.error("Failed to load component:", error);
  }
}

export async function loadInitialComponents(
  setLoadedImages: React.Dispatch<React.SetStateAction<{ [key: string]: HTMLImageElement }>>,
  setComponents: React.Dispatch<React.SetStateAction<DroppedComponent[]>>,
  setWires: React.Dispatch<React.SetStateAction<Wire[]>>
) {
  try {
    const response = await fetch('/configs/arduino-fix.json');
    const config = await response.json();

    // const response = await fetch('/packages/Microcontrollers/Arduino/arduino-uno/arduino-uno.json');
    // const config = await response.json();

    // Load all images first
    const imageLoadPromises = config.components.map(async (component: DroppedComponent) => {
      const img = await preloadImage(component.image.src);
      component.image.width = img.naturalWidth;
      component.image.height = img.naturalHeight;
      return { src: component.image.src, img };
    });

    const loadedImgs = await Promise.all(imageLoadPromises);
    
    // Update loadedImages state
    setLoadedImages((prev) => {
      const newImages = { ...prev };
      loadedImgs.forEach(({ src, img }) => {
        newImages[src] = img;
      });
      return newImages;
    });

    // Set components
    setComponents(config.components);
    
    // Only set wires if they exist in the config
    if (config.wires && config.wires.length > 0) {
        // const config.wires = [
        //     { "id": "wire-1", "points": [x0, y0, x1, y1], "color": "#ff0000" },
        //     { "id": "wire-2", "points": [x0, y0, x1, y1], "color": "#ff0000" },
        // ]
        setWires(config.wires);
    }

  } catch (error) {
    console.error("Failed to load initial components:", error);
  }
} 