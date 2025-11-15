export const cropWithRemBG = async (base64Image: string, boundingBox: any, componentName?: string, componentDescription?: string): Promise<string> => {
  // First try traditional cropping
  const croppedResult = await traditionalCrop(base64Image, boundingBox);
  
  // Check if cropping failed due to invalid bounds or other issues
  if (croppedResult === 'INVALID_BOUNDS' || croppedResult === base64Image) {
    // Use Gemini for invalid bounds or failed crops
    if (componentName && componentDescription) {
      try {
        console.log('🤖 Using Gemini for component with invalid/failed bounds:', componentName);
        const geminiResult = await generateComponentWithGemini(base64Image, componentName, componentDescription, boundingBox);
        if (geminiResult && geminiResult !== base64Image && geminiResult.length > 100) {
          console.log('✅ Gemini successfully generated component:', componentName);
          return geminiResult;
        } else {
          console.warn('⚠️ Gemini returned invalid result for:', componentName);
        }
      } catch (error) {
        console.error('❌ Gemini generation failed for', componentName, ':', error?.message || error);
      }
    }
    
    // Try simple grid crop as fallback
    console.log('🔄 Trying simple grid crop for:', componentName);
    const gridCrop = await simpleGridCrop(base64Image, boundingBox);
    if (gridCrop !== base64Image) {
      return gridCrop;
    }
    
    // Create a placeholder component as last resort
    return createPlaceholderComponent(componentName || 'Component');
  }
  
  // Return successful crop
  return croppedResult;
};

const createPlaceholderComponent = (componentName: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 300;
  canvas.height = 150;
  
  // Gray background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, 300, 150);
  
  // Border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 298, 148);
  
  // Text
  ctx.fillStyle = '#666';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('📦 Component', 150, 60);
  
  ctx.font = '12px Arial';
  ctx.fillText(componentName, 150, 85);
  
  ctx.font = '10px Arial';
  ctx.fillStyle = '#999';
  ctx.fillText('Extraction Failed', 150, 105);
  
  return canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
};

const simpleGridCrop = (base64Image: string, boundingBox: any): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Use a simple 200x200 crop from the general area
      const centerX = Math.max(0, Math.min(img.width - 200, (boundingBox.x / 100) * img.width));
      const centerY = Math.max(0, Math.min(img.height - 200, (boundingBox.y / 100) * img.height));
      
      canvas.width = 200;
      canvas.height = 200;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.drawImage(img, centerX, centerY, 200, 200, 0, 0, 200, 200);
      
      resolve(canvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
    };
    img.onerror = () => resolve(base64Image);
    img.src = `data:image/jpeg;base64,${base64Image}`;
  });
};

const generateComponentWithGemini = async (
  originalBase64: string, 
  componentName: string, 
  componentDescription: string,
  boundingBox: { x: number; y: number; width: number; height: number },
  retryCount = 0
): Promise<string> => {
  try {
    const { GoogleGenAI, Modality } = await import('@google/genai');
    const FREE_GEMINI_KEY = import.meta.env.VITE_GEMINI_FREE_KEY || 'AIzaSyDhSh4A6_F-C5t5ca2fzJjOh0lWJQ9A9j0';
    const ai = new GoogleGenAI({ apiKey: FREE_GEMINI_KEY });
    
    console.log(`🔍 Gemini request for: ${componentName} (attempt ${retryCount + 1})`);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: originalBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Find and extract this pharmaceutical component from the image:

COMPONENT: ${componentName}
DESCRIPTION: ${componentDescription}

INSTRUCTIONS:
1. Locate the "${componentName}" component in the pharmaceutical material
2. Extract ONLY that specific element (${componentDescription})
3. Create a clean, isolated version with white background
4. Maintain original text readability and visual quality
5. Remove all other elements and backgrounds
6. Ensure the component is complete and properly cropped

Generate a clean isolated version of just this pharmaceutical component.`
          }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    console.log('✅ Gemini response received for:', componentName);
    
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          console.log('✨ Gemini generated component successfully:', componentName);
          return part.inlineData.data;
        }
      }
    }
    
    console.warn('⚠️ No image data in Gemini response for:', componentName);
    throw new Error('No image generated by Gemini');
    
  } catch (error: any) {
    console.error(`❌ Gemini generation error for ${componentName} (attempt ${retryCount + 1}):`, error?.message || error);
    
    // Retry for API overload (503) errors
    if (error?.message?.includes('overloaded') && retryCount < 2) {
      const delay = (retryCount + 1) * 2000; // 2s, 4s delays
      console.log(`⏳ Retrying ${componentName} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateComponentWithGemini(originalBase64, componentName, componentDescription, boundingBox, retryCount + 1);
    }
    
    throw error;
  }
};

const traditionalCrop = (base64Image: string, boundingBox: any): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(base64Image);
        return;
      }
      
      const { x, y, width, height } = boundingBox;
      
      // Validate bounding box - signal failure for invalid bounds
      if (x < 0 || y < 0 || width <= 5 || height <= 5 || x > 100 || y > 100) {
        resolve('INVALID_BOUNDS');
        return;
      }
      
      try {
        const cropX = Math.max(0, Math.floor((x / 100) * img.width));
        const cropY = Math.max(0, Math.floor((y / 100) * img.height));
        const cropWidth = Math.min(img.width - cropX, Math.max(20, Math.floor((width / 100) * img.width)));
        const cropHeight = Math.min(img.height - cropY, Math.max(20, Math.floor((height / 100) * img.height)));
        
        if (cropWidth < 20 || cropHeight < 20) {
          resolve('INVALID_BOUNDS');
          return;
        }
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cropWidth, cropHeight);
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        
        const result = canvas.toDataURL('image/jpeg', 0.95);
        const base64Result = result.split(',')[1];
        
        // Always return cropped result if we got this far
        resolve(base64Result);
      } catch (error) {
        // Return a small white image instead of original
        const errorCanvas = document.createElement('canvas');
        const errorCtx = errorCanvas.getContext('2d')!;
        errorCanvas.width = 100;
        errorCanvas.height = 100;
        errorCtx.fillStyle = '#ffffff';
        errorCtx.fillRect(0, 0, 100, 100);
        resolve(errorCanvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
      }
    };
    img.onerror = () => {
      // Return white placeholder instead of original
      const errorCanvas = document.createElement('canvas');
      const errorCtx = errorCanvas.getContext('2d')!;
      errorCanvas.width = 100;
      errorCanvas.height = 100;
      errorCtx.fillStyle = '#ffffff';
      errorCtx.fillRect(0, 0, 100, 100);
      resolve(errorCanvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64Image}`;
  });
};