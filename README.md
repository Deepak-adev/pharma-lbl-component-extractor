<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PharmaLBL Studio - Professional Pharmaceutical Label Generation Platform

A comprehensive AI-powered platform for extracting, editing, and generating pharmaceutical marketing materials (LBLs) with advanced component management and intelligent cropping capabilities.

## 🚀 New Features

### 📋 LBL Type Selection
- **Multiple LBL Types**: Choose from 8 pharmaceutical material types:
  - Product Detail Aid
  - Patient Brochure  
  - Prescriber Guide
  - Sales Aid
  - Clinical Summary
  - Safety Profile
  - Mechanism of Action
  - Dosing Guide
- **Customizable Variations**: Set 1-5 variations per LBL type
- **Generation Instructions**: Detailed instruction box for specific requirements, brand guidelines, and regulatory considerations

### ✂️ Advanced Component Cropping
- **Interactive Cropping Interface**: Drag-and-drop cropping with visual feedback
- **Real-time Enhancement Controls**:
  - Brightness adjustment (50-150%)
  - Contrast control (50-150%)
  - Saturation adjustment (0-200%)
  - Sharpness filter (0-100%)
- **Precision Mode**: Exact coordinate input for pixel-perfect cropping
- **Preset Crop Ratios**: Square, Landscape (16:9), Portrait (9:16), Banner (3:1)
- **Smart Crop Suggestions**: AI-powered cropping recommendations based on component type
- **Component Library Integration**: Save enhanced components for reuse across projects

### 💾 Component Repository
- **Persistent Storage**: Save cropped and enhanced components locally
- **Usage Tracking**: Monitor component popularity and usage statistics
- **Quality Ratings**: Categorize components by quality (low, medium, high, premium)
- **Advanced Filtering**: Search by category, tags, quality, and project
- **Export/Import**: Backup and share component libraries

## 🛠️ Technical Enhancements

### Advanced Cropping Technology
- **Canvas-based Editing**: High-performance HTML5 canvas implementation
- **Image Enhancement Algorithms**: Custom sharpening and auto-enhancement filters
- **Smart Bounding Box Detection**: AI-powered component boundary detection
- **Multi-format Support**: JPEG, PNG, PDF processing with quality preservation

### Intelligent Generation
- **Context-Aware Prompting**: LBL type-specific generation instructions
- **Brand Kit Integration**: Consistent branding across all generated materials
- **Color Extraction**: Automatic brand color detection from uploaded materials
- **Regulatory Compliance**: Built-in pharmaceutical industry best practices

## 🎯 Use Cases

1. **Pharmaceutical Marketing Teams**: Generate multiple LBL variations for different audiences
2. **Medical Affairs**: Create clinical summaries and safety profiles
3. **Sales Teams**: Develop targeted sales aids and prescriber guides
4. **Regulatory Affairs**: Ensure consistent branding and compliance across materials
5. **Creative Agencies**: Streamline pharmaceutical marketing material production

## 📊 Workflow

1. **Upload**: Upload 5-10 pharmaceutical marketing materials (PDF/Images)
2. **Extract**: AI automatically identifies and extracts components
3. **Enhance**: Use advanced cropping tools to perfect component quality
4. **Select Types**: Choose specific LBL types and variation counts
5. **Instruct**: Provide detailed generation instructions
6. **Generate**: Create professional pharmaceutical materials
7. **Save**: Store enhanced components in the repository for future use

## 🔧 Installation & Setup

**Prerequisites:** Node.js 16+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Keys:**
   Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   ```
   VITE_GEMINI_FREE_KEY=your_gemini_api_key_here
   VITE_GEMINI_PAID_KEY=your_paid_gemini_api_key_here
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Access the platform:**
   Open http://localhost:5173 in your browser

## 🎨 Features Overview

- **AI-Powered Component Extraction**: Automatically identify and categorize pharmaceutical marketing elements
- **Advanced Image Processing**: Professional-grade cropping and enhancement tools
- **Multi-Type LBL Generation**: Create targeted materials for different stakeholders
- **Brand Consistency**: Maintain brand guidelines across all generated materials
- **Component Library**: Build and manage reusable component collections
- **Regulatory Compliance**: Built-in pharmaceutical industry standards
- **Export Capabilities**: Download high-quality materials in multiple formats

## 📈 Performance

- **Fast Processing**: Optimized AI models for quick component extraction
- **High Quality**: Professional-grade output suitable for regulatory submission
- **Scalable**: Handle multiple projects and large component libraries
- **Reliable**: Robust error handling and data persistence

## 🔒 Data Privacy

- **Local Storage**: All data processed and stored locally in your browser
- **No Data Transmission**: Sensitive pharmaceutical data never leaves your environment
- **Secure Processing**: Industry-standard security practices

View the original AI Studio app: https://ai.studio/apps/temp/1
