import { GoogleGenAI, GenerateContentResponse, Type, Modality } from '@google/genai';
import type { ImageComponent, ComponentCategory, LBLVariation, BrandKit } from '../types';
import { componentCategories } from '../types';
import { generateWithKandinsky, createPromptFromVariation } from './imageGenerationService';
import { enhanceImage, generateHighQualityImage, generateWithSDXL } from './imageEnhancementService';
import * as fs from "node:fs";


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
            model: 'gemini-2.5-flash',
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
  let generatedImage: string;

  // Try multiple high-quality generation methods
  try {
    // Method 1: Try Gemini first
    try {
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
          text: `Create a HIGH-QUALITY professional pharmaceutical Leave Behind Literature (LBL) design. This is a medical marketing brochure for doctors, NOT a poster or general advertisement.
          
          CRITICAL REQUIREMENTS:
          - Medical/pharmaceutical industry standard layout
          - Professional typography with medical credibility
          - Clean white/light background with subtle medical blue accents
          - Product information hierarchy: Brand name → Indication → Key benefits → Clinical data
          - Regulatory compliance visual style
          - Doctor-facing professional tone
          - SHARP, HIGH-RESOLUTION, PROFESSIONAL QUALITY
          
          Layout: "${variation.title}"
          Strategy: "${variation.description}"
          Pages: ${pageCount}
          
          ${brandInstructions}
          
          Create a single composite image showing the LBL layout with pharmaceutical industry standards - clean, trustworthy, medical-grade design quality.`,
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            generatedImage = part.inlineData.data;
            break;
          }
        }
      }
      
      if (!generatedImage) {
        throw new Error('No image data in Gemini response');
      }

    } catch (geminiError) {
      console.warn('Gemini failed, trying SDXL:', geminiError);
      
      // Method 2: Try Stable Diffusion XL
      try {
        const prompt = createPromptFromVariation(variation, components, brandKit);
        generatedImage = await generateWithSDXL(prompt);
      } catch (sdxlError) {
        console.warn('SDXL failed, trying enhanced FLUX:', sdxlError);
        
        // Method 3: Try enhanced FLUX.1-dev
        try {
          const prompt = createPromptFromVariation(variation, components, brandKit);
          generatedImage = await generateHighQualityImage(prompt, 1024, 768);
        } catch (fluxError) {
          console.warn('Enhanced FLUX failed, using Kandinsky:', fluxError);
          
          // Method 4: Fallback to Kandinsky
          const prompt = createPromptFromVariation(variation, components, brandKit);
          generatedImage = await generateWithKandinsky(prompt, components);
        }
      }
    }

    // Apply AI enhancement pipeline to improve quality
    console.log('Applying AI enhancement pipeline...');
    const enhancedImage = await enhanceImage(generatedImage, {
      upscale: true,
      denoise: true,
      sharpen: true,
      colorCorrection: true
    });

    return enhancedImage;

  } catch (error) {
    console.error('All image generation methods failed:', error);
    throw new Error('Failed to generate high-quality LBL image. Please try again.');
  }
};