import { enterpriseExtract, type PharmaLabelData } from './quickExtract';
import { validateExtraction, type ValidationResult } from './validationEngine';
import { componentRepo, type StoredComponent } from './componentStorage';

export interface PipelineResult {
  success: boolean;
  data?: PharmaLabelData;
  validation?: ValidationResult;
  stored_components?: StoredComponent[];
  error?: string;
  processing_time: number;
}

export interface PipelineOptions {
  apiKey?: string;
  projectId?: string;
  sourceFile?: string;
  validateResults?: boolean;
  storeComponents?: boolean;
  fallbackToGrid?: boolean;
}

/**
 * Enterprise-grade pharmaceutical label processing pipeline
 * Combines edge detection, contour analysis, OCR, and Gemini reasoning
 */
export class EnterprisePipeline {
  
  /**
   * Process a pharmaceutical label through the complete pipeline
   */
  static async process(base64: string, options: PipelineOptions = {}): Promise<PipelineResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Extract components using advanced pipeline
      console.log('🔍 Starting component extraction...');
      const extractionResult = await enterpriseExtract(base64, options.apiKey);
      
      // Handle fallback case (returns string[] instead of PharmaLabelData)
      if (Array.isArray(extractionResult)) {
        if (!options.fallbackToGrid) {
          return {
            success: false,
            error: 'Advanced extraction failed and fallback disabled',
            processing_time: Date.now() - startTime
          };
        }
        
        // Convert grid extraction to basic PharmaLabelData
        const basicData: PharmaLabelData = {
          product_name: 'Extracted via Grid Method',
          drug_components: [],
          claims: [],
          clinical_trials: [],
          statistics: [],
          taglines: [],
          logos: [],
          icons: [],
          badges: [],
          person_images: [],
          regulatory_blocks: [],
          colors_used: [],
          layout_regions: extractionResult.map((crop, idx) => ({
            component_type: 'grid_region',
            normalized_name: `Region ${idx + 1}`,
            raw_text: '',
            confidence: 0.5,
            bbox: [0, 0, 100, 100] as [number, number, number, number],
            crop_base64: crop
          }))
        };
        
        return {
          success: true,
          data: basicData,
          processing_time: Date.now() - startTime
        };
      }
      
      const data = extractionResult as PharmaLabelData;
      console.log('✅ Component extraction completed');
      
      let validation: ValidationResult | undefined;
      let stored_components: StoredComponent[] | undefined;
      
      // Step 2: Validate results if requested
      if (options.validateResults && options.apiKey) {
        console.log('🔍 Validating extraction results...');
        validation = await validateExtraction(data, options.apiKey);
        console.log(`✅ Validation completed - Score: ${validation.score}/100`);
      }
      
      // Step 3: Store components if requested
      if (options.storeComponents) {
        console.log('💾 Storing components to library...');
        stored_components = componentRepo.storeFromExtraction(
          data, 
          options.projectId, 
          options.sourceFile
        );
        console.log(`✅ Stored ${stored_components.length} components`);
      }
      
      return {
        success: true,
        data,
        validation,
        stored_components,
        processing_time: Date.now() - startTime
      };
      
    } catch (error) {
      console.error('❌ Pipeline processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time: Date.now() - startTime
      };
    }
  }
  
  /**
   * Batch process multiple pharmaceutical labels
   */
  static async processBatch(
    images: Array<{ base64: string; filename?: string }>, 
    options: PipelineOptions = {}
  ): Promise<PipelineResult[]> {
    console.log(`🚀 Starting batch processing of ${images.length} images...`);
    
    const results: PipelineResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`📄 Processing image ${i + 1}/${images.length}: ${image.filename || 'unnamed'}`);
      
      const result = await this.process(image.base64, {
        ...options,
        sourceFile: image.filename
      });
      
      results.push(result);
      
      // Brief pause between processing to avoid rate limits
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Batch processing completed: ${successful}/${images.length} successful`);
    
    return results;
  }
  
  /**
   * Get processing statistics
   */
  static getStats(): {
    library_stats: ReturnType<typeof componentRepo.getStats>;
    recent_processing: {
      total_processed: number;
      success_rate: number;
      avg_processing_time: number;
    };
  } {
    const library_stats = componentRepo.getStats();
    
    // In a real implementation, you'd track processing stats
    const recent_processing = {
      total_processed: library_stats.total,
      success_rate: 0.95, // Mock data
      avg_processing_time: 2500 // Mock data in ms
    };
    
    return {
      library_stats,
      recent_processing
    };
  }
}

/**
 * Convenience function for single image processing
 */
export const processPharmaceuticalLabel = async (
  base64: string, 
  options: PipelineOptions = {}
): Promise<PipelineResult> => {
  return EnterprisePipeline.process(base64, {
    validateResults: true,
    storeComponents: true,
    fallbackToGrid: true,
    ...options
  });
};

/**
 * Convenience function for batch processing
 */
export const processBatchLabels = async (
  images: Array<{ base64: string; filename?: string }>,
  options: PipelineOptions = {}
): Promise<PipelineResult[]> => {
  return EnterprisePipeline.processBatch(images, {
    validateResults: true,
    storeComponents: true,
    fallbackToGrid: true,
    ...options
  });
};