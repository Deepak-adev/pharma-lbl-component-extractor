export type AppState = 'idle' | 'files_uploaded' | 'processing' | 'components_extracted' | 'generating' | 'variations_generated' | 'error';

export interface UploadedFile {
  file: File;
  preview: string;
}

export const componentCategories = [
  'Brand Logo',
  'Product Name/Title',
  'Product Image/Packshot',
  'Indication Text',
  'Dosage Information',
  'Mechanism of Action',
  'Clinical Data/Efficacy',
  'Safety Information',
  'Side Effects',
  'Contraindications',
  'Prescribing Information',
  'Patient Population',
  'Healthcare Provider Info',
  'Contact Information',
  'Regulatory Text',
  'Warning/Black Box',
  'QR Code',
  'Website/URL',
  'Medical Illustration',
  'Chart/Graph/Data',
  'Timeline/Process',
  'Before/After Images',
  'Patient Journey',
  'Lifestyle Image',
  'Doctor/HCP Image',
  'Call to Action',
  'Footer/Disclaimer',
  'Header Section',
  'Subheading',
  'Bullet Points',
  'Table/Comparison',
  'Icon/Symbol',
  'Badge/Certification',
  'Price/Cost Info',
  'Insurance Coverage',
  'Patient Support',
  'Clinical Trial Info',
  'References/Citations',
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