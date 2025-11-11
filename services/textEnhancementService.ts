import { GoogleGenAI } from '@google/genai';

export interface TextQualityCheck {
  isLegible: boolean;
  isMarketingFriendly: boolean;
  suggestedImprovements: string[];
  enhancedText?: string;
}

export const textEnhancementService = {
  /**
   * Analyzes text for legibility and marketing-friendliness
   */
  analyzeText: async (ai: GoogleGenAI, text: string): Promise<TextQualityCheck> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this pharmaceutical marketing text for legibility and marketing effectiveness:

"${text}"

Evaluate:
1. Is the text clear and legible?
2. Is it marketing-friendly for pharmaceutical products?
3. What improvements could be made?
4. Provide an enhanced version if needed.

Return JSON with: isLegible (boolean), isMarketingFriendly (boolean), suggestedImprovements (array), enhancedText (string).`,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Error analyzing text:', error);
      return {
        isLegible: true,
        isMarketingFriendly: true,
        suggestedImprovements: [],
        enhancedText: text
      };
    }
  },

  /**
   * Enhances text for better marketing appeal
   */
  enhanceForMarketing: async (ai: GoogleGenAI, text: string, context: string = 'pharmaceutical marketing'): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Enhance this text for ${context}. Make it more professional, clear, and marketing-friendly while maintaining accuracy:

Original: "${text}"

Return only the enhanced text, no explanations.`
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error enhancing text:', error);
      return text;
    }
  }
};