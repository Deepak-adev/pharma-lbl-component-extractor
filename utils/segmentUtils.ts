export const extractComponentRegions = (base64: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const regions = findContentRegions(imageData);
      
      const components: string[] = [];
      
      for (const region of regions) {
        const regionCanvas = document.createElement('canvas');
        const regionCtx = regionCanvas.getContext('2d')!;
        
        regionCanvas.width = region.width;
        regionCanvas.height = region.height;
        
        regionCtx.drawImage(
          img,
          region.x, region.y, region.width, region.height,
          0, 0, region.width, region.height
        );
        
        const componentBase64 = regionCanvas.toDataURL('image/jpeg', 0.8);
        components.push(componentBase64.split(',')[1]);
      }
      
      resolve(components.length > 0 ? components : [base64]);
    };
    
    img.src = `data:image/jpeg;base64,${base64}`;
  });
};

const findContentRegions = (imageData: ImageData): Array<{x: number, y: number, width: number, height: number}> => {
  const { width, height, data } = imageData;
  const visited = new Array(width * height).fill(false);
  const regions: Array<{x: number, y: number, width: number, height: number}> = [];
  
  const isBackground = (x: number, y: number): boolean => {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Consider white/light colors as background
    return r > 240 && g > 240 && b > 240;
  };
  
  const floodFill = (startX: number, startY: number): {minX: number, minY: number, maxX: number, maxY: number} | null => {
    const stack = [{x: startX, y: startY}];
    let minX = startX, minY = startY, maxX = startX, maxY = startY;
    let pixelCount = 0;
    
    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[y * width + x] || isBackground(x, y)) continue;
      
      visited[y * width + x] = true;
      pixelCount++;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
    }
    
    // Filter out tiny regions
    return pixelCount > 500 ? {minX, minY, maxX, maxY} : null;
  };
  
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      if (!visited[y * width + x] && !isBackground(x, y)) {
        const bounds = floodFill(x, y);
        if (bounds) {
          const padding = 10;
          regions.push({
            x: Math.max(0, bounds.minX - padding),
            y: Math.max(0, bounds.minY - padding),
            width: Math.min(width - bounds.minX + padding, bounds.maxX - bounds.minX + 2 * padding),
            height: Math.min(height - bounds.minY + padding, bounds.maxY - bounds.minY + 2 * padding)
          });
        }
      }
    }
  }
  
  return regions.slice(0, 8); // Limit to 8 components max
};