import { GoogleGenAI, GenerateContentResponse, Type, Modality } from '@google/genai';
import type { ImageComponent, ComponentCategory, LBLVariation, BrandKit } from '../types';
import { componentCategories } from '../types';

const CATEGORIES: readonly ComponentCategory[] = componentCategories;

export const analyzeAndCategorizeImage = async (ai: GoogleGenAI, base64: string, mimeType: string): Promise<Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `As an Indian Pharmaceutical Marketing Expert, analyze this image from a piece of marketing material (LBL). Identify distinct visual components within it. For each component, provide a short, descriptive "name", a brief "description" of its content and marketing purpose, and a "category". Return a JSON array of objects.
                        
                        The category must be one of the following: ${CATEGORIES.join(', ')}.
                        
                        Consider the context of visuals used in Indian medical marketing. For example, differentiate between a generic lifestyle image and one specifically tailored to an Indian audience. If no clear, distinct marketing components are found, return an empty array.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING, enum: [...CATEGORIES] },
                        },
                        required: ["name", "description", "category"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result as Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[];

    } catch (error) {
        console.error('Error analyzing image with Gemini:', error);
        return []; // Return empty array on failure to avoid crashing the process
    }
};

export const generateLBLVariations = async (ai: GoogleGenAI, components: ImageComponent[], pageCount: number, brandKit?: BrandKit): Promise<LBLVariation[]> => {
    const componentDetails = components.map(c => `- ID: ${c.id}, Name: ${c.name}, Category: ${c.category}, Description: ${c.description}`).join('\n');
    
    let brandInstructions = '';
    if (brandKit) {
        brandInstructions = `
        Crucially, all layout concepts must adhere to the following brand guidelines:
        - Primary Color: ${brandKit.primaryColor}
        - Secondary Color: ${brandKit.secondaryColor}
        - Font Style: A professional and clean font, similar to ${brandKit.font}.
        - The overall tone should be consistent with a premium, trustworthy pharmaceutical brand.
        `;
    }

    const prompt = `
    Acting as a senior marketing strategist for a top Indian pharma company, create 5 distinct layout variations for a new ${pageCount}-page LBL using the following components:
    ${componentDetails}

    Consider different marketing goals for each variation:
    - One focused on launching a new product (high-impact visuals).
    - One for reinforcing clinical data (data-driven, professional).
    - One for patient education (simple, clear, and reassuring).
    - One for a conference giveaway (visually engaging, key messages).
    - A creative, out-of-the-box option.
    
    ${brandInstructions}

    For each of the 5 variations, provide:
    1. A "title" that reflects its strategic marketing goal (e.g., 'Clinical Data-Driven Layout').
    2. A "description" of the layout concept and page-by-page content flow strategy.
    3. An "orderedComponentIds" array that lists the component IDs in the suggested order of appearance. Use the provided component IDs only. Try to use all selected components across the pages.

    The output must be a valid JSON array of 5 objects, each conforming to this structure.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            orderedComponentIds: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["title", "description", "orderedComponentIds"]
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result as LBLVariation[];
    } catch (error) {
        console.error('Error generating LBL variations with Gemini:', error);
        throw new Error('Failed to generate LBL variations from AI.');
    }
};

export const reconstructLBLImage = async (
  ai: GoogleGenAI,
  variation: LBLVariation,
  components: ImageComponent[],
  pageCount: number,
  brandKit?: BrandKit
): Promise<string> => {

  let brandInstructions = 'The design should be clean, modern, and professional.';
  if (brandKit) {
      brandInstructions = `
      The design must adhere to strict brand guidelines:
      - The primary brand color is ${brandKit.primaryColor}. Use it for headlines, key accents, and backgrounds where appropriate.
      - The secondary brand color is ${brandKit.secondaryColor}. Use it for secondary elements, call-outs, or subtle highlights.
      - The overall typography should be clean and professional, reflecting a font like ${brandKit.font}.
      - The provided brand logo must be placed appropriately, usually at the top or bottom corner, to ensure brand presence.
      `;
  }

  const parts: any[] = [
    {
      text: `You are a creative graphic designer for the Indian pharmaceutical industry. Your task is to create a single, cohesive image representing a multi-page LBL.
      
      Layout Concept: "${variation.title}"
      Description: "${variation.description}"
      Number of Pages: ${pageCount}

      Arrange the following components logically and professionally onto a clean, modern, and aesthetically pleasing background to create the final LBL mockup. The components are provided in their intended order of appearance. Adhere to the layout description. 
      
      ${brandInstructions}

      The final output should be a single, high-quality image that looks like a professional marketing asset, not a collage. Blend the components seamlessly.
      `,
    },
  ];

  if (brandKit?.logo) {
    parts.push({
      inlineData: {
        data: brandKit.logo.base64,
        mimeType: brandKit.logo.mimeType,
      },
    });
    parts.push({ text: `This is the official Brand Logo. Incorporate it into the design.` });
  }

  components.forEach(component => {
    parts.push({
      inlineData: {
        data: component.base64,
        mimeType: component.mimeType,
      },
    });
    parts.push({ text: `Component to include: ${component.name} (${component.category})` });
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error('No image was generated by the AI.');

  } catch (error) {
    console.error('Error reconstructing LBL image with Gemini:', error);
    throw new Error('Failed to reconstruct LBL image from AI.');
  }
};