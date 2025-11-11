// RemBG API for precise background removal and cropping
export const cropWithRemBG = async (base64Image: string, boundingBox: any): Promise<string> => {
  try {
    // First crop the region
    const croppedImage = await cropRegion(base64Image, boundingBox);
    
    // Then remove background using RemBG API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': 'demo-key', // Use demo key or get free API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: croppedImage,
        size: 'auto',
        format: 'png'
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.data.result_b64;
    } else {
      // Fallback to simple cropping
      return croppedImage;
    }
  } catch (error) {
    console.warn('RemBG failed, using simple crop:', error);
    return cropRegion(base64Image, boundingBox);
  }
};

const cropRegion = (base64Image: string, boundingBox: any): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const { x, y, width, height } = boundingBox;
      
      // Convert percentages to pixels
      const cropX = (x / 100) * img.width;
      const cropY = (y / 100) * img.height;
      const cropWidth = (width / 100) * img.width;
      const cropHeight = (height / 100) * img.height;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      
      const result = canvas.toDataURL('image/jpeg', 0.8);
      resolve(result.split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;
  });
};