import type { PharmaLabelData } from './advancedExtraction';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export class PharmaValidationEngine {
  private geminiApiKey: string;

  constructor(apiKey: string) {
    this.geminiApiKey = apiKey;
  }

  // Rule-based validation
  private validateStructure(data: PharmaLabelData): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!data.product_name || data.product_name === 'Unknown Product') {
      errors.push('Product name is missing or invalid');
    }

    if (!data.drug_components || data.drug_components.length === 0) {
      errors.push('Drug components are missing');
    }

    // Validate dosage patterns
    data.drug_components.forEach((comp, idx) => {
      if (!comp.strength || !/\d+\s*(mg|g|ml|mcg|%)/i.test(comp.strength)) {
        warnings.push(`Invalid dosage format for component ${idx + 1}: ${comp.strength}`);
      }
    });

    // Check for essential components
    if (data.logos.length === 0) {
      warnings.push('No logos detected - may affect brand recognition');
    }

    if (data.regulatory_blocks.length === 0) {
      warnings.push('No regulatory text detected - compliance may be incomplete');
    }

    return { errors, warnings };
  }

  // Gemini cross-validation
  private async validateWithGemini(data: PharmaLabelData): Promise<{ errors: string[]; warnings: string[] }> {
    const prompt = `You are a pharmaceutical regulatory expert. Validate this extracted label data for accuracy and compliance:

${JSON.stringify(data, null, 2)}

Check for:
1. Proper drug naming conventions
2. Dosage format accuracy  
3. Required regulatory elements
4. Brand consistency
5. Clinical trial data validity

Return JSON with:
{
  "errors": ["critical issues that must be fixed"],
  "warnings": ["minor issues or suggestions"]
}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const result = await response.json();
      return JSON.parse(result.candidates[0].content.parts[0].text);
    } catch (error) {
      return { errors: [], warnings: ['Gemini validation unavailable'] };
    }
  }

  // Calculate quality score
  private calculateScore(data: PharmaLabelData, errors: string[], warnings: string[]): number {
    let score = 100;
    
    // Deduct for errors
    score -= errors.length * 15;
    
    // Deduct for warnings
    score -= warnings.length * 5;
    
    // Bonus for completeness
    if (data.product_name && data.product_name !== 'Unknown Product') score += 5;
    if (data.drug_components.length > 0) score += 10;
    if (data.logos.length > 0) score += 5;
    if (data.clinical_trials.length > 0) score += 10;
    if (data.regulatory_blocks.length > 0) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  async validate(data: PharmaLabelData): Promise<ValidationResult> {
    const structureValidation = this.validateStructure(data);
    const geminiValidation = await this.validateWithGemini(data);
    
    const allErrors = [...structureValidation.errors, ...geminiValidation.errors];
    const allWarnings = [...structureValidation.warnings, ...geminiValidation.warnings];
    
    const score = this.calculateScore(data, allErrors, allWarnings);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      score
    };
  }
}

export const validateExtraction = async (data: PharmaLabelData, apiKey: string): Promise<ValidationResult> => {
  const validator = new PharmaValidationEngine(apiKey);
  return await validator.validate(data);
};