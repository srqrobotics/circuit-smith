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
  const arduino_uno = {
    src: "/packages/Microcontrollers/Arduino/arduino-uno/arduino-uno.png",
    width: 0,
    height: 0,
  };

  const ultrasonic = {
    src: "/packages/Modules/sr04.png",
    width: 0,
    height: 0,
  };

  try {
    const uno = await preloadImage(arduino_uno.src);
    arduino_uno.width = uno.naturalWidth;
    arduino_uno.height = uno.naturalHeight;

    const uSonic = await preloadImage(ultrasonic.src);
    ultrasonic.width = uSonic.naturalWidth;
    ultrasonic.height = uSonic.naturalHeight;

    setLoadedImages((prev) => ({
      ...prev,
      [arduino_uno.src]: uno,
      [ultrasonic.src]: uSonic,
    }));

    setComponents([
      {
        id: "arduino-uno",
        name: "Arduino Uno",
        x: 500,
        y: 250,
        rotation: 0,
        image: arduino_uno,
      },
      {
        id: "uSonic",
        name: "Ultrasonic SR04",
        x: 394,
        y: 100,
        rotation: 0,
        image: ultrasonic,
      },
    ]);

    setWires([
      { id: "arduino-pin-03", points: [508, 283, 492, 283, 482, 273, 482, 173], color: "#ff00ff"},
      { id: "arduino-pin-04", points: [508, 291, 482, 291, 472, 281, 472, 173], color: "#ff00ff"},

    //   { id: "arduino-pin-05", points: [508, 299, 472, 299], color: "#ff0000"},
    //   { id: "arduino-pin-06", points: [508, 307, 472, 307], color: "#ff0000"},
    //   { id: "arduino-pin-07", points: [508, 315, 472, 315], color: "#ff0000"},
    //   { id: "arduino-pin-08", points: [508, 323, 472, 323], color: "#ff0000"},
    //   { id: "arduino-pin-09", points: [508, 339, 472, 339], color: "#ff0000"},
    //   { id: "arduino-pin-10", points: [508, 347, 472, 347], color: "#ff0000"},
    //   { id: "arduino-pin-11", points: [508, 355, 472, 355], color: "#ff0000"},
    //   { id: "arduino-pin-12", points: [508, 363, 472, 363], color: "#ff0000"},
    //   { id: "arduino-pin-13", points: [508, 371, 472, 371], color: "#ff0000"},
    //   { id: "arduino-pin-14", points: [508, 379, 472, 379], color: "#ff0000"},
    //   { id: "arduino-pin-15", points: [508, 387, 472, 387], color: "#ff0000"},

    //   { id: "arduino-pin-16", points: [651, 267, 670, 267], color: "#00ff00"},
    //   { id: "arduino-pin-17", points: [651, 275, 670, 275], color: "#00ff00"},
    //   { id: "arduino-pin-18", points: [651, 283, 670, 283], color: "#00ff00"},
    //   { id: "arduino-pin-19", points: [651, 291, 670, 291], color: "#00ff00"},
    //   { id: "arduino-pin-10", points: [651, 299, 670, 299], color: "#00ff00"},
    //   { id: "arduino-pin-21", points: [651, 307, 670, 307], color: "#00ff00"},

    //   { id: "arduino-pin-22", points: [651, 323, 670, 323], color: "#00ff00"},
      { id: "arduino-pin-23", points: [651, 331, 670, 331, 680, 321, 680, 250, 670, 240, 462, 240, 462, 173], color: "#ff0000"},
      { id: "arduino-pin-24", points: [651, 339, 680, 339, 690, 329, 690, 250, 670, 230, 492, 230, 492, 173], color: "#000000"},
    //   { id: "arduino-pin-25", points: [651, 347, 670, 347], color: "#00ff00"},
    //   { id: "arduino-pin-26", points: [651, 355, 670, 355], color: "#00ff00"},
    //   { id: "arduino-pin-27", points: [651, 363, 670, 363], color: "#00ff00"},
    ]);
  } catch (error) {
    console.error("Failed to load initial components:", error);
  }
} 