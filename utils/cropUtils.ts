export interface CropBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EnhancementOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  removeBackground?: boolean;
  autoEnhance?: boolean;
}

export const cropImageFromBoundingBox = (
  originalBase64: string,
  boundingBox: CropBoundingBox,
  enhancementOptions?: EnhancementOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      const { x, y, width, height } = boundingBox;
      
      // Convert percentages to pixels
      const cropX = (x / 100) * img.width;
      const cropY = (y / 100) * img.height;
      const cropWidth = (width / 100) * img.width;
      const cropHeight = (height / 100) * img.height;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Apply enhancements if specified
      if (enhancementOptions) {
        const { brightness = 100, contrast = 100, saturation = 100 } = enhancementOptions;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      }
      
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
      
      // Apply sharpening if needed
      if (enhancementOptions?.sharpness && enhancementOptions.sharpness > 0) {
        const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
        const sharpened = applySharpenFilter(imageData, enhancementOptions.sharpness / 100);
        ctx.putImageData(sharpened, 0, 0);
      }
      
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      resolve(croppedBase64.split(',')[1]);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = `data:image/jpeg;base64,${originalBase64}`;
  });
};

// Advanced AI-powered smart cropping
export const smartCropComponent = async (
  originalBase64: string,
  componentType: string,
  targetAspectRatio?: number
): Promise<{ boundingBox: CropBoundingBox; confidence: number }> => {
  // This would integrate with AI services for intelligent cropping
  // For now, return a smart default based on component type
  const smartDefaults: Record<string, CropBoundingBox> = {
    'Brand Logo': { x: 5, y: 5, width: 30, height: 20 },
    'Product Image (Packshot)': { x: 20, y: 15, width: 60, height: 70 },
    'Medical Illustration/Diagram': { x: 10, y: 10, width: 80, height: 60 },
    'Data Visualization (Chart/Graph)': { x: 15, y: 20, width: 70, height: 50 },
    'Header/Footer Element': { x: 0, y: 0, width: 100, height: 15 },
    'Call to Action': { x: 60, y: 80, width: 35, height: 15 }
  };
  
  const defaultBox = smartDefaults[componentType] || { x: 10, y: 10, width: 80, height: 80 };
  
  // Adjust for target aspect ratio if provided
  if (targetAspectRatio) {
    const currentRatio = defaultBox.width / defaultBox.height;
    if (currentRatio > targetAspectRatio) {
      // Too wide, reduce width
      const newWidth = defaultBox.height * targetAspectRatio;
      defaultBox.x += (defaultBox.width - newWidth) / 2;
      defaultBox.width = newWidth;
    } else if (currentRatio < targetAspectRatio) {
      // Too tall, reduce height
      const newHeight = defaultBox.width / targetAspectRatio;
      defaultBox.y += (defaultBox.height - newHeight) / 2;
      defaultBox.height = newHeight;
    }
  }
  
  return {
    boundingBox: defaultBox,
    confidence: 0.8
  };
};

// Enhanced cropping with multiple suggestions
export const generateCropSuggestions = async (
  originalBase64: string,
  componentType: string
): Promise<Array<{ name: string; boundingBox: CropBoundingBox; confidence: number }>> => {
  const suggestions = [
    {
      name: 'Tight Crop',
      boundingBox: await smartCropComponent(originalBase64, componentType, undefined),
      confidence: 0.9
    },
    {
      name: 'Standard Crop',
      boundingBox: {
        boundingBox: { x: 15, y: 15, width: 70, height: 70 },
        confidence: 0.8
      },
      confidence: 0.8
    },
    {
      name: 'Wide Crop',
      boundingBox: {
        boundingBox: { x: 5, y: 25, width: 90, height: 50 },
        confidence: 0.7
      },
      confidence: 0.7
    }
  ];
  
  return suggestions.map(s => ({
    name: s.name,
    boundingBox: s.boundingBox.boundingBox,
    confidence: s.confidence
  }));
};

// Sharpening filter implementation
const applySharpenFilter = (imageData: ImageData, amount: number): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new ImageData(width, height);
  
  // Sharpening kernel
  const kernel = [
    0, -amount, 0,
    -amount, 1 + 4 * amount, -amount,
    0, -amount, 0
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        result.data[idx] = Math.max(0, Math.min(255, sum));
      }
      result.data[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]; // Alpha
    }
  }
  
  return result;
};

// Auto-enhance image quality
export const autoEnhanceImage = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  const result = new ImageData(imageData.width, imageData.height);
  
  // Calculate histogram
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }
  
  // Find min and max values (excluding extremes)
  let min = 0, max = 255;
  const totalPixels = imageData.width * imageData.height;
  const threshold = totalPixels * 0.01; // 1% threshold
  
  let count = 0;
  for (let i = 0; i < 256; i++) {
    count += histogram[i];
    if (count > threshold && min === 0) min = i;
    if (count > totalPixels - threshold && max === 255) {
      max = i;
      break;
    }
  }
  
  // Apply contrast stretching
  const range = max - min;
  if (range > 0) {
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const normalized = (data[i + c] - min) / range;
        result.data[i + c] = Math.max(0, Math.min(255, normalized * 255));
      }
      result.data[i + 3] = data[i + 3]; // Alpha
    }
  } else {
    result.data.set(data);
  }
  
  return result;
};