import type { ImageComponent, LBLVariation, BrandKit } from '../types';

// Enhanced image generation using FLUX.1-dev with component images
export const generateWithKandinsky = async (
  prompt: string,
  components: ImageComponent[]
): Promise<string> => {
  try {
    // Enhanced prompt with component details and quality keywords
    const componentDetails = components.map(c => 
      `Include ${c.name} (${c.category}): ${c.description}`
    ).join('. ');
    
    const enhancedPrompt = `${prompt}. ${componentDetails}. Compose these elements into a cohesive pharmaceutical marketing layout. HIGH QUALITY, professional, sharp details, clean design, medical grade, 8k resolution, masterpiece quality.`;

    const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
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
    console.error('FLUX.1-dev generation failed:', error);
    throw error;
  }
};

export const createPromptFromVariation = (
  variation: LBLVariation,
  components: ImageComponent[],
  brandKit?: BrandKit
): string => {
  const componentDescriptions = components.map(c => `${c.name}: ${c.description}`).join(', ');
  
  return `HIGH-QUALITY professional pharmaceutical Leave Behind Literature (LBL) for doctors. Medical marketing brochure layout: "${variation.title}". ${variation.description}. 
  Medical elements: ${componentDescriptions}. 
  ${brandKit ? `Brand colors: ${brandKit.primaryColor}, ${brandKit.secondaryColor}.` : 'Medical blue and white color scheme.'}
  Pharmaceutical industry standard, doctor-facing, clinical credibility, regulatory compliant design, medical typography, clean professional layout.
  REQUIREMENTS: Sharp details, high resolution, professional quality, clean design, medical grade appearance, 8k quality, masterpiece.`;
};