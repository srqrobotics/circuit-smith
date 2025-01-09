import { preloadImage } from './imageLoader';
import type { DroppedComponent } from '~/types/circuit';

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
  const arduinoImage = {
    src: "/packages/Microcontrollers/Arduino/arduino-uno/arduino-uno.png",
    width: 0,
    height: 0,
  };

  try {
    const img = await preloadImage(arduinoImage.src);
    arduinoImage.width = img.naturalWidth;
    arduinoImage.height = img.naturalHeight;

    setLoadedImages((prev) => ({
      ...prev,
      [arduinoImage.src]: img,
    }));

    setComponents([
      {
        id: "initial-arduino",
        name: "Arduino Uno",
        x: 50,
        y: 50,
        image: arduinoImage,
      },
    ]);

    setWires([
      {
        id: "initial-wire",
        points: [50, 50, 150, 50, 150, 150],
        color: "#ff0000",
      },
    ]);
  } catch (error) {
    console.error("Failed to load initial components:", error);
  }
} 