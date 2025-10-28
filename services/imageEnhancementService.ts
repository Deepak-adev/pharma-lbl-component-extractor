// Free AI image enhancement services
export interface EnhancementOptions {
  upscale?: boolean;
  denoise?: boolean;
  sharpen?: boolean;
  colorCorrection?: boolean;
}

// Real-ESRGAN for upscaling (Hugging Face)
export const upscaleImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: base64Image,
        parameters: {
          scale: 2 // 2x upscaling
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Real-ESRGAN API error: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Real-ESRGAN upscaling failed:', error);
    return base64Image; // Return original if enhancement fails
  }
};

// GFPGAN for face enhancement (Hugging Face)
export const enhanceFaces = async (base64Image: string): Promise<string> => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/akhaliq/GFPGAN', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: base64Image
      })
    });

    if (!response.ok) {
      throw new Error(`GFPGAN API error: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('GFPGAN face enhancement failed:', error);
    return base64Image;
  }
};

// SwinIR for image restoration (Hugging Face)
export const restoreImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/caidas/swinIR-M', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: base64Image
      })
    });

    if (!response.ok) {
      throw new Error(`SwinIR API error: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('SwinIR restoration failed:', error);
    return base64Image;
  }
};

// Enhanced FLUX.1-dev with better parameters
export const generateHighQualityImage = async (
  prompt: string,
  width: number = 1024,
  height: number = 768
): Promise<string> => {
  try {
    const enhancedPrompt = `${prompt}, high quality, professional, sharp details, vibrant colors, 8k resolution, masterpiece`;

    const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          width,
          height,
          num_inference_steps: 50, // Higher steps for better quality
          guidance_scale: 7.5,
          scheduler: "DPMSolverMultistepScheduler"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`FLUX.1-dev API error: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('High-quality FLUX.1-dev generation failed:', error);
    throw error;
  }
};

// Main enhancement pipeline
export const enhanceImage = async (
  base64Image: string,
  options: EnhancementOptions = {}
): Promise<string> => {
  let enhancedImage = base64Image;

  try {
    // Step 1: Restore image quality
    if (options.denoise !== false) {
      enhancedImage = await restoreImage(enhancedImage);
    }

    // Step 2: Enhance faces if present
    if (options.colorCorrection !== false) {
      enhancedImage = await enhanceFaces(enhancedImage);
    }

    // Step 3: Upscale for better resolution
    if (options.upscale !== false) {
      enhancedImage = await upscaleImage(enhancedImage);
    }

    return enhancedImage;
  } catch (error) {
    console.warn('Image enhancement pipeline failed:', error);
    return base64Image; // Return original if all enhancements fail
  }
};

// Alternative: Stable Diffusion XL for high-quality generation
export const generateWithSDXL = async (prompt: string): Promise<string> => {
  try {
    const enhancedPrompt = `${prompt}, professional pharmaceutical marketing design, high quality, detailed, clean layout, medical grade`;

    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          width: 1024,
          height: 768,
          num_inference_steps: 50,
          guidance_scale: 8.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`SDXL API error: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('SDXL generation failed:', error);
    throw error;
  }
};