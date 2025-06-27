export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Prepend BASE_URL if src is a relative path
    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(src);
    img.src = isAbsolute
      ? src
      : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;
    img.onload = () => {
      console.log("Image loaded successfully:", img.src);
      resolve(img);
    };
    img.onerror = (error) => {
      console.error("Error loading image:", img.src, error);
      reject(new Error(`Failed to load image: ${img.src}`));
    };
    console.log("Starting to load image:", img.src);
  });
}
