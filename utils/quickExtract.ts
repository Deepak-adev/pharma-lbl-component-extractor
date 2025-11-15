export const quickExtract = (base64: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const components: string[] = [];
      
      // Resize image first to reduce size
      const maxSize = 400;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Quick 2x2 grid extraction
      const regions = [
        { x: 0, y: 0, w: width/2, h: height/2 },
        { x: width/2, y: 0, w: width/2, h: height/2 },
        { x: 0, y: height/2, w: width/2, h: height/2 },
        { x: width/2, y: height/2, w: width/2, h: height/2 }
      ];
      
      for (const region of regions) {
        const regionCanvas = document.createElement('canvas');
        const regionCtx = regionCanvas.getContext('2d')!;
        
        regionCanvas.width = region.w;
        regionCanvas.height = region.h;
        
        regionCtx.drawImage(canvas, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
        
        const base64Result = regionCanvas.toDataURL('image/jpeg', 0.3);
        components.push(base64Result.split(',')[1]);
      }
      
      resolve(components);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
};