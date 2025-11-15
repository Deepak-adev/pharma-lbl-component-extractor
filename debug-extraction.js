// Debug script for component extraction
import { GoogleGenAI } from '@google/genai';

const FREE_GEMINI_KEY = 'AIzaSyDhSh4A6_F-C5t5ca2fzJjOh0lWJQ9A9j0';

async function testExtraction() {
  console.log('Testing Gemini API connection...');
  
  try {
    const ai = new GoogleGenAI({ apiKey: FREE_GEMINI_KEY });
    
    // Simple text test first
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, can you respond with "API Working"?'
    });
    
    console.log('API Response:', response.text);
    
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', error.message);
  }
}

testExtraction();