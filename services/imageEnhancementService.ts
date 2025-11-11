import { GoogleGenAI, Modality } from '@google/genai';

export interface EnhancementOptions {
  enhance?: boolean;
}

// Gemini-based image enhancement through regeneration
export const enhanceImageWithGemini = async (
  ai: GoogleGenAI,
  base64Image: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Enhance this image to MAXIMUM quality. Create a high-resolution, professional, sharp, and detailed version. Improve clarity, colors, contrast, and overall visual quality. Make it look like a premium pharmaceutical marketing material with medical-grade presentation quality. Output should be crisp, clean, and professional.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error('No enhanced image data in Gemini response');
  } catch (error) {
    console.warn('Gemini enhancement failed:', error);
    return base64Image;
  }
};