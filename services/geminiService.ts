import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { ImageComponent, ComponentCategory, LBLVariation, BrandKit } from '../types';
import { componentCategories } from '../types';

const FREE_GEMINI_KEY = import.meta.env.VITE_GEMINI_FREE_KEY || 'AIzaSyDhSh4A6_F-C5t5ca2fzJjOh0lWJQ9A9j0';
const PAID_GEMINI_KEY = import.meta.env.VITE_GEMINI_PAID_KEY || 'AIzaSyDhSh4A6_F-C5t5ca2fzJjOh0lWJQ9A9j0';

const CATEGORIES: readonly ComponentCategory[] = componentCategories;

export interface LBLGenerationOptions {
  theme: 'professional' | 'modern' | 'clinical' | 'patient-friendly' | 'premium';
  colorScheme: 'blue' | 'green' | 'red' | 'purple' | 'custom';
  layout: 'grid' | 'flowing' | 'minimal' | 'detailed';
  customPrompt?: string;
}

export const analyzeAndCategorizeImage = async (base64: string, mimeType: string): Promise<Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]> => {
    const ai = new GoogleGenAI({ apiKey: FREE_GEMINI_KEY });
    
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
                        text: `ULTRA-PRECISE PHARMACEUTICAL COMPONENT EXTRACTION
                        
                        COMPUTER VISION ANALYSIS:
                        1. Detect ALL visual containers, boxes, frames, boundaries
                        2. Identify complete design elements WITH backgrounds
                        3. Find text blocks WITH complete containers (boxes, backgrounds, borders)
                        4. Locate images WITH frames and surrounding space
                        5. Map visual hierarchy and containment relationships
                        
                        BOUNDARY PRECISION RULES:
                        - If text has background/box → include ENTIRE background area
                        - If element has borders → include borders + padding + margins
                        - If element has shadows → include shadow area
                        - If multiple elements form group → capture group boundary
                        - Expand boundaries by 8% to ensure completeness
                        
                        For each component:
                        1. "name": descriptive identifier
                        2. "description": complete visual content + design elements
                        3. "category": ${CATEGORIES.join(', ')}
                        4. "boundingBox": EXPANDED coordinates {x, y, width, height} as percentages
                        
                        CRITICAL: Boundaries must capture 100% of visual elements.`
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
                            boundingBox: {
                                type: Type.OBJECT,
                                properties: {
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER },
                                    width: { type: Type.NUMBER },
                                    height: { type: Type.NUMBER }
                                },
                                required: ["x", "y", "width", "height"]
                            }
                        },
                        required: ["name", "description", "category", "boundingBox"]
                    }
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        return result as Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[];

    } catch (error) {
        console.error('Error analyzing image:', error);
        throw new Error(`Failed to analyze image with AI. Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generateLBLVariations = async (
  components: ImageComponent[], 
  pageCount: number, 
  options: LBLGenerationOptions, 
  brandKit?: BrandKit,
  extractedColors?: { primary: string; secondary: string; accent: string; dominant: string[] }
): Promise<LBLVariation[]> => {
    const ai = new GoogleGenAI({ apiKey: PAID_GEMINI_KEY });
    
    const componentDetails = components.map(c => `- ID: ${c.id}, Name: ${c.name}, Category: ${c.category}, Description: ${c.description}`).join('\n');
    
    const prompt = `
    Create 3 pharmaceutical LBL variations using the provided components.
    
    Available Components:
    ${componentDetails}
    
    REQUIREMENTS:
    - ${pageCount}-page pharmaceutical marketing materials
    - Professional medical design standards for ${pageCount} pages
    - Use ALL provided components distributed across ${pageCount} pages
    - Proper pharmaceutical terminology and spelling
    - Include clinical data and regulatory information
    - Plan content flow across ${pageCount} pages with logical progression
    
    Generate these 3 variations:
    1. Clinical Focus - Emphasize medical data and efficacy across ${pageCount} pages
    2. Patient Education - Clear, accessible information for patients over ${pageCount} pages
    3. Professional Detail - Comprehensive information for healthcare providers in ${pageCount} pages
    
    Each variation must include:
    - Professional title indicating ${pageCount}-page format
    - Detailed description of the multi-page layout approach
    - orderedComponentIds array containing ALL component IDs
    - Page flow strategy for ${pageCount} pages
    
    Custom Instructions: ${options.customPrompt || `Standard ${pageCount}-page pharmaceutical design`}
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
                    },
                    minItems: 3,
                    maxItems: 3
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        const allComponentIds = components.map(c => c.id);
        return result.map((variation: LBLVariation) => ({
            ...variation,
            orderedComponentIds: allComponentIds
        })) as LBLVariation[];
    } catch (error) {
        console.error('Error generating LBL variations:', error);
        throw new Error(`Failed to generate LBL variations. Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generateSinglePage = async (
  variation: LBLVariation,
  components: ImageComponent[],
  pageNumber: number,
  totalPages: number,
  options: LBLGenerationOptions,
  brandKit?: BrandKit,
  originalImage?: string,
  extractedColors?: { primary: string; secondary: string; accent: string; dominant: string[] }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: PAID_GEMINI_KEY });

  const pageType = pageNumber === 1 ? 'Cover/Introduction' : 
                   pageNumber === totalPages ? 'Summary/Regulatory' : 
                   'Content/Clinical Data';

  const parts: any[] = [
    {
      text: `Create page ${pageNumber} of ${totalPages} for a professional pharmaceutical marketing material.
      
      PAGE TYPE: ${pageType}
      REQUIREMENTS:
      - Single page design (page ${pageNumber} of ${totalPages})
      - Professional pharmaceutical layout
      - Use relevant components for this page type
      - Maintain consistent branding across pages
      
      Title: "${variation.title}"
      Description: "${variation.description}"
      
      PAGE-SPECIFIC INSTRUCTIONS:
      ${pageNumber === 1 ? 
        '- Cover page with main branding, product name, key message\n- Include logo prominently\n- Eye-catching design to grab attention' :
        pageNumber === totalPages ?
        '- Summary page with regulatory information\n- Contact details and disclaimers\n- Safety information and warnings' :
        '- Content page with clinical data and product details\n- Charts, graphs, and detailed information\n- Professional medical content'}
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
    parts.push({ text: `Brand Logo - ${pageNumber === 1 ? 'use prominently on cover' : 'include as header/footer element'}` });
  }

  if (originalImage) {
    parts.push({
      inlineData: {
        data: originalImage,
        mimeType: 'image/jpeg',
      },
    });
    parts.push({ text: `REFERENCE STYLE: Use this as style guide for page ${pageNumber}` });
  }

  const componentsPerPage = Math.ceil(components.length / totalPages);
  const startIndex = (pageNumber - 1) * componentsPerPage;
  const endIndex = Math.min(startIndex + componentsPerPage, components.length);
  const pageComponents = components.slice(startIndex, endIndex);

  pageComponents.forEach((component, index) => {
    parts.push({
      inlineData: {
        data: component.base64,
        mimeType: component.mimeType,
      },
    });
    parts.push({ 
      text: `COMPONENT: ${component.name} (${component.category}) - Include in page ${pageNumber} layout` 
    });
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
    
    throw new Error(`No image generated for page ${pageNumber}`);

  } catch (error) {
    console.error(`Error generating page ${pageNumber}:`, error);
    throw new Error(`Failed to generate page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const reconstructLBLImage = async (
  variation: LBLVariation,
  components: ImageComponent[],
  pageCount: number,
  options: LBLGenerationOptions,
  brandKit?: BrandKit,
  originalImage?: string,
  extractedColors?: { primary: string; secondary: string; accent: string; dominant: string[] }
): Promise<string[]> => {
  const pages: string[] = [];
  
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const pageImage = await generateSinglePage(
      variation,
      components,
      pageNumber,
      pageCount,
      options,
      brandKit,
      originalImage,
      extractedColors
    );
    pages.push(pageImage);
  }
  
  return pages;
};