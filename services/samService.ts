// SAM (Segment Anything Model) integration for precise component extraction
export const extractComponentsWithSAM = async (base64Image: string): Promise<string[]> => {
  try {
    // Use Roboflow's SAM API for object detection and segmentation
    const response = await fetch('https://detect.roboflow.com/segment-anything/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: 'rf_demo_key', // Demo key for testing
        image: base64Image,
        format: 'json',
        confidence: 0.3,
        overlap: 0.5
      })
    });

    if (!response.ok) {
      throw new Error('SAM API failed');
    }

    const result = await response.json();
    const components: string[] = [];

    // Extract each detected segment
    for (const detection of result.predictions || []) {
      if (detection.mask) {
        const croppedComponent = await cropWithMask(base64Image, detection);
        if (croppedComponent) {
          components.push(croppedComponent);
        }
      }
    }

    return components.length > 0 ? components : [base64Image];
  } catch (error) {
    console.warn('SAM extraction failed, using fallback:', error);
    return await fallbackExtraction(base64Image);
  }
};

const cropWithMask = async (originalBase64: string, detection: any): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const { x, y, width, height } = detection;
      const padding = 10;
      
      canvas.width = width + padding * 2;
      canvas.height = height + padding * 2;
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the cropped region
      ctx.drawImage(
        img,
        x - padding, y - padding, width + padding * 2, height + padding * 2,
        0, 0, canvas.width, canvas.height
      );
      
      const result = canvas.toDataURL('image/jpeg', 0.9);
      resolve(result.split(',')[1]);
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/jpeg;base64,${originalBase64}`;
  });
};

const fallbackExtraction = async (base64Image: string): Promise<string[]> => {
  // Smart grid-based extraction as fallback
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const components: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Divide image into smart regions
      const regions = [
        { x: 0, y: 0, w: img.width * 0.5, h: img.height * 0.3 }, // Top-left
        { x: img.width * 0.5, y: 0, w: img.width * 0.5, h: img.height * 0.3 }, // Top-right
        { x: 0, y: img.height * 0.3, w: img.width, h: img.height * 0.4 }, // Middle
        { x: 0, y: img.height * 0.7, w: img.width, h: img.height * 0.3 } // Bottom
      ];
      
      for (const region of regions) {
        if (hasContent(ctx, region)) {
          const regionCanvas = document.createElement('canvas');
          const regionCtx = regionCanvas.getContext('2d')!;
          
          regionCanvas.width = region.w;
          regionCanvas.height = region.h;
          
          regionCtx.drawImage(img, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
          
          const componentBase64 = regionCanvas.toDataURL('image/jpeg', 0.8);
          components.push(componentBase64.split(',')[1]);
        }
      }
      
      resolve(components.length > 0 ? components : [base64Image]);
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;
  });
};

const hasContent = (ctx: CanvasRenderingContext2D, region: any): boolean => {
  const imageData = ctx.getImageData(region.x, region.y, region.w, region.h);
  const data = imageData.data;
  let nonWhitePixels = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < 240 || g < 240 || b < 240) {
      nonWhitePixels++;
    }
  }
  
  return nonWhitePixels > (region.w * region.h * 0.05); // At least 5% non-white
};