export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  dominant: string[];
}

export const extractColorsFromImage = async (base64: string): Promise<ExtractedColors> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (!imageData) return resolve({ primary: '#1976D2', secondary: '#4CAF50', accent: '#FF5722', dominant: [] });
      
      const colorMap = new Map<string, number>();
      
      // Sample every 10th pixel for performance
      for (let i = 0; i < imageData.data.length; i += 40) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        
        if (a < 128) continue; // Skip transparent pixels
        
        // Skip very light/dark colors
        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 225) continue;
        
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
      
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => color)
        .slice(0, 10);
      
      const primary = sortedColors[0] || '#1976D2';
      const secondary = sortedColors[1] || '#4CAF50';
      const accent = sortedColors[2] || '#FF5722';
      
      resolve({
        primary,
        secondary,
        accent,
        dominant: sortedColors.slice(0, 5)
      });
    };
    
    img.src = `data:image/jpeg;base64,${base64}`;
  });
};