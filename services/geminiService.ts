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
                        text: `PHARMACEUTICAL COMPONENT EXTRACTION - COMPREHENSIVE ANALYSIS

                        Analyze this pharmaceutical marketing material and extract ALL visible components with maximum precision.

                        DETECTION REQUIREMENTS:
                        - Find 10-20 distinct components (extract everything visible)
                        - Include text blocks, images, logos, charts, tables, icons, backgrounds
                        - Detect overlapping elements separately
                        - Identify small details like regulatory text, disclaimers, contact info
                        - Find decorative elements, borders, and design components

                        COMPONENT CATEGORIES: ${CATEGORIES.join(', ')}

                        BOUNDING BOX PRECISION:
                        - Use percentage coordinates (0-100) for x, y, width, height
                        - Ensure complete content capture (don't cut off text/images)
                        - Add 2-3% padding around each component for safety
                        - For text: capture full lines including line spacing
                        - For images: include any borders or shadows
                        - For logos: include surrounding whitespace

                        COMPONENT TYPES TO FIND:
                        1. HEADERS & TITLES: Main headlines, product names, section titles
                        2. BODY TEXT: Paragraphs, descriptions, bullet points, captions
                        3. REGULATORY TEXT: Disclaimers, warnings, legal text, fine print
                        4. PRODUCT IMAGES: Main product shots, supporting visuals, lifestyle images
                        5. LOGOS & BRANDING: Company logos, product logos, certification marks
                        6. DATA ELEMENTS: Charts, graphs, tables, statistics, comparisons
                        7. ICONS & SYMBOLS: Feature icons, benefit symbols, navigation elements
                        8. CONTACT INFO: Phone numbers, websites, addresses, QR codes
                        9. DECORATIVE ELEMENTS: Borders, backgrounds, design flourishes
                        10. CALL-TO-ACTION: Buttons, highlighted text, action prompts

                        OUTPUT FORMAT:
                        For each component provide:
                        - "name": Specific descriptive name (e.g., "Main Product Headline", "Efficacy Data Chart")
                        - "description": Detailed description of content and purpose
                        - "category": Exact category from the provided list
                        - "boundingBox": Precise coordinates with padding for complete capture

                        QUALITY STANDARDS:
                        - Prioritize completeness over speed
                        - Ensure no visible element is missed
                        - Verify bounding boxes capture complete content
                        - Use specific, descriptive names for each component`
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

  const pageType = pageNumber === 1 ? 'Front Cover' : 
                   pageNumber === totalPages ? 'Back Cover' : 
                   'Content Page';

  const parts: any[] = [
    {
      text: `Create page ${pageNumber} of ${totalPages} for a professional pharmaceutical marketing material.
      
      PAGE TYPE: ${pageType}
      REQUIREMENTS:
      - Single page design (page ${pageNumber} of ${totalPages})
      - CONSISTENT SIZE: 8.5x11 inches (US Letter) at 300 DPI
      - Professional pharmaceutical layout
      - Use relevant components for this page type
      - Maintain consistent branding across pages
      - EXACT DIMENSIONS: 2550x3300 pixels for high quality
      
      Title: "${variation.title}"
      Description: "${variation.description}"
      
      PAGE-SPECIFIC INSTRUCTIONS:
      ${pageNumber === 1 ? 
        '- FRONT COVER: Main branding, product name, key visual\n- Include logo prominently\n- Eye-catching pharmaceutical design' :
        pageNumber === totalPages ?
        '- BACK COVER: Regulatory information and disclaimers\n- Contact details and company info\n- Safety warnings and legal text' :
        `- CONTENT PAGE ${pageNumber - 1}: Clinical data and product details\n- Charts, graphs, and detailed information\n- Professional medical content for page ${pageNumber - 1} of ${totalPages - 2}`}
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

  let pageComponents: ImageComponent[] = [];
  
  if (pageNumber === 1) {
    // Front cover: Use branding components
    pageComponents = components.filter(c => 
      c.category === 'Brand Logo' || 
      c.category === 'Product Image (Packshot)' ||
      c.category === 'Key Feature Icon'
    ).slice(0, 3);
  } else if (pageNumber === totalPages) {
    // Back cover: Use regulatory components
    pageComponents = components.filter(c => 
      c.category === 'Regulatory Text Block' ||
      c.category === 'Header/Footer Element'
    ).slice(0, 2);
  } else {
    // Content pages: Distribute remaining components
    const contentPages = totalPages - 2;
    const contentComponents = components.filter(c => 
      !['Brand Logo', 'Regulatory Text Block', 'Header/Footer Element'].includes(c.category)
    );
    const componentsPerPage = Math.ceil(contentComponents.length / contentPages);
    const contentPageIndex = pageNumber - 2;
    const startIndex = contentPageIndex * componentsPerPage;
    const endIndex = Math.min(startIndex + componentsPerPage, contentComponents.length);
    pageComponents = contentComponents.slice(startIndex, endIndex);
  }

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
  const totalPages = pageCount + 2; // Add 2 extra pages (first + last)
  
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const pageImage = await generateSinglePage(
      variation,
      components,
      pageNumber,
      totalPages,
      options,
      brandKit,
      originalImage,
      extractedColors
    );
    pages.push(pageImage);
  }
  
  return pages;
};

