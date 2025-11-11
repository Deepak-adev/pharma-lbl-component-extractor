export type AppState = 'idle' | 'files_uploaded' | 'processing' | 'components_extracted' | 'generating' | 'variations_generated' | 'error';

export interface UploadedFile {
  file: File;
  preview: string;
}

export const componentCategories = [
  'Brand Logo',
  'Product Image (Packshot)',
  'Medical Illustration/Diagram',
  'Data Visualization (Chart/Graph)',
  'Lifestyle Imagery',
  'Doctor/Patient Photo',
  'Key Feature Icon',
  'Dosage/Instructional Graphic',
  'Regulatory Text Block',
  'Header/Footer Element',
  'Call to Action',
  'Other'
] as const;

export type ComponentCategory = typeof componentCategories[number];

export interface ImageComponent {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  base64: string;
  mimeType: string;
}

export interface LBLVariation {
  title: string;
  description: string;
  orderedComponentIds: string[];
  reconstructedImage?: string;
  reconstructedPages?: string[]; // Array of base64 images for each page
  pageCount?: number;
  lblType?: string;
}

export interface BrandKit {
  logo?: {
    base64: string;
    mimeType: string;
  };
  primaryColor: string;
  secondaryColor: string;
  font: string;
}

export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  dominant: string[];
}