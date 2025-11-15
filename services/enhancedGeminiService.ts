import { GoogleGenAI, Type } from '@google/genai';
import type { ImageComponent, ComponentCategory } from '../types';
import { componentCategories } from '../types';
import { advancedExtractionService } from './advancedExtractionService';

const FREE_GEMINI_KEY = import.meta.env.VITE_GEMINI_FREE_KEY || 'AIzaSyDhSh4A6_F-C5t5ca2fzJjOh0lWJQ9A9j0';

export const enhancedAnalyzeAndCategorizeImage = async (base64: string, mimeType: string): Promise<Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]> => {
    try {
        // Step 1: Use advanced computer vision for initial detection
        console.log('🔍 Starting advanced computer vision analysis...');
        const cvResults = await advancedExtractionService.extractComponents(base64, mimeType);
        console.log(`📊 Computer vision found ${cvResults.components.length} components`);

        // Step 2: Use enhanced AI analysis for comprehensive detection
        console.log('🤖 Starting enhanced AI analysis...');
        const aiResults = await performEnhancedAIAnalysis(base64, mimeType);
        console.log(`🧠 AI analysis found ${aiResults.length} components`);

        // Step 3: Combine and optimize results
        const combinedResults = combineAndOptimizeResults(cvResults.components, aiResults);
        console.log(`✨ Final optimized results: ${combinedResults.length} components`);

        return combinedResults;

    } catch (error) {
        console.error('❌ Enhanced analysis failed, falling back to AI-only:', error);
        // Fallback to AI-only analysis
        return await performEnhancedAIAnalysis(base64, mimeType);
    }
};

const performEnhancedAIAnalysis = async (base64: string, mimeType: string): Promise<Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]> => {
    const ai = new GoogleGenAI({ apiKey: FREE_GEMINI_KEY });
    
    const enhancedPrompt = `
    PHARMACEUTICAL COMPONENT EXTRACTION - COMPREHENSIVE ANALYSIS

    Analyze this pharmaceutical marketing material and extract ALL visible components with maximum precision.

    DETECTION REQUIREMENTS:
    - Find 15-25 distinct components (extract everything visible)
    - Include text blocks, images, logos, charts, tables, icons, backgrounds
    - Detect overlapping elements separately
    - Identify small details like regulatory text, disclaimers, contact info
    - Find decorative elements, borders, and design components

    COMPONENT CATEGORIES: ${componentCategories.join(', ')}

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
    - Use specific, descriptive names for each component
    `;

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
                        text: enhancedPrompt
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
                            category: { type: Type.STRING, enum: [...componentCategories] },
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
        
        // Validate and clean results
        const validatedResults = validateAndCleanResults(result);
        
        return validatedResults;

    } catch (error) {
        console.error('❌ Enhanced AI analysis failed:', error);
        throw new Error(`Enhanced AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const combineAndOptimizeResults = (
    cvResults: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[],
    aiResults: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]
): Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[] => {
    
    console.log('🔄 Combining computer vision and AI results...');
    
    // Start with AI results as they're more comprehensive
    const combined = [...aiResults];
    
    // Add CV results that don't overlap significantly with AI results
    for (const cvComponent of cvResults) {
        const hasSignificantOverlap = combined.some(aiComponent => 
            calculateOverlap(cvComponent.boundingBox, aiComponent.boundingBox) > 0.5
        );
        
        if (!hasSignificantOverlap) {
            combined.push(cvComponent);
        }
    }
    
    // Remove duplicates and overlapping components
    const optimized = removeDuplicatesAndOverlaps(combined);
    
    // Sort by position (top to bottom, left to right)
    optimized.sort((a, b) => {
        const yDiff = a.boundingBox.y - b.boundingBox.y;
        if (Math.abs(yDiff) < 5) { // Same row
            return a.boundingBox.x - b.boundingBox.x;
        }
        return yDiff;
    });
    
    console.log(`✅ Optimization complete: ${optimized.length} final components`);
    return optimized;
};

const calculateOverlap = (
    box1: { x: number; y: number; width: number; height: number },
    box2: { x: number; y: number; width: number; height: number }
): number => {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const overlapArea = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const minArea = Math.min(area1, area2);
    
    return overlapArea / minArea;
};

const removeDuplicatesAndOverlaps = (
    components: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]
): Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[] => {
    
    const filtered: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[] = [];
    
    // Sort by area (largest first) to prioritize larger components
    const sorted = [...components].sort((a, b) => {
        const areaA = a.boundingBox.width * a.boundingBox.height;
        const areaB = b.boundingBox.width * b.boundingBox.height;
        return areaB - areaA;
    });
    
    for (const component of sorted) {
        const hasSignificantOverlap = filtered.some(existing => 
            calculateOverlap(component.boundingBox, existing.boundingBox) > 0.7
        );
        
        if (!hasSignificantOverlap) {
            filtered.push(component);
        }
    }
    
    return filtered;
};

const validateAndCleanResults = (
    results: any[]
): Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[] => {
    
    const validated: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[] = [];
    
    for (const result of results) {
        // Validate required fields
        if (!result.name || !result.description || !result.category || !result.boundingBox) {
            console.warn('⚠️ Skipping invalid component:', result);
            continue;
        }
        
        // Validate bounding box
        const bbox = result.boundingBox;
        if (typeof bbox.x !== 'number' || typeof bbox.y !== 'number' || 
            typeof bbox.width !== 'number' || typeof bbox.height !== 'number') {
            console.warn('⚠️ Skipping component with invalid bounding box:', result);
            continue;
        }
        
        // Ensure bounding box is within valid range
        if (bbox.x < 0 || bbox.y < 0 || bbox.width <= 0 || bbox.height <= 0 ||
            bbox.x > 100 || bbox.y > 100 || bbox.x + bbox.width > 100 || bbox.y + bbox.height > 100) {
            console.warn('⚠️ Fixing out-of-bounds bounding box:', bbox);
            
            // Fix the bounding box
            bbox.x = Math.max(0, Math.min(95, bbox.x));
            bbox.y = Math.max(0, Math.min(95, bbox.y));
            bbox.width = Math.max(1, Math.min(100 - bbox.x, bbox.width));
            bbox.height = Math.max(1, Math.min(100 - bbox.y, bbox.height));
        }
        
        // Validate category
        if (!componentCategories.includes(result.category)) {
            console.warn('⚠️ Invalid category, using default:', result.category);
            result.category = 'Other Element';
        }
        
        // Clean and enhance names and descriptions
        result.name = cleanText(result.name);
        result.description = cleanText(result.description);
        
        validated.push({
            name: result.name,
            description: result.description,
            category: result.category,
            boundingBox: bbox
        });
    }
    
    console.log(`✅ Validated ${validated.length} components out of ${results.length} raw results`);
    return validated;
};

const cleanText = (text: string): string => {
    return text
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\-\(\)\.,:;]/g, '')
        .substring(0, 200); // Limit length
};

// Enhanced cropping function that works with the new extraction
export const enhancedCropComponent = async (
    base64: string, 
    boundingBox: { x: number; y: number; width: number; height: number }
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            // Calculate actual pixel coordinates
            const x = Math.floor((boundingBox.x / 100) * img.width);
            const y = Math.floor((boundingBox.y / 100) * img.height);
            const width = Math.floor((boundingBox.width / 100) * img.width);
            const height = Math.floor((boundingBox.height / 100) * img.height);
            
            // Set canvas size to cropped dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw the cropped portion
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            
            // Convert to base64 with high quality
            const croppedBase64 = canvas.toDataURL('image/jpeg', 0.95);
            resolve(croppedBase64.split(',')[1]);
        };
        img.onerror = reject;
        img.src = `data:image/jpeg;base64,${base64}`;
    });
};