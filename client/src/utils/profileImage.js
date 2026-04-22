const MAX_CANVAS_SIZE = 256;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the image."));
    };

    image.src = objectUrl;
  });

export const fileToProfileDataUrl = async (file) => {
  if (!file) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");

  canvas.width = MAX_CANVAS_SIZE;
  canvas.height = MAX_CANVAS_SIZE;

  const context = canvas.getContext("2d");
  const shortestSide = Math.min(image.width, image.height);
  const sourceX = (image.width - shortestSide) / 2;
  const sourceY = (image.height - shortestSide) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    shortestSide,
    shortestSide,
    0,
    0,
    MAX_CANVAS_SIZE,
    MAX_CANVAS_SIZE
  );

  return canvas.toDataURL("image/jpeg", 0.82);
};
