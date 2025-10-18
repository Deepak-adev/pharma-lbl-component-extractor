import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

import type { AppState, ImageComponent, LBLVariation, BrandKit } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { processPdf } from './services/pdfService';
import { analyzeAndCategorizeImage, generateLBLVariations, reconstructLBLImage } from './services/geminiService';

import FileUpload from './components/FileUpload';
import ComponentGallery from './components/ComponentGallery';
import LBLVariationsDisplay from './components/LBLVariationsDisplay';
import BrandKitModal from './components/BrandKitModal';
import ComponentEditModal from './components/ComponentEditModal';
import { BrandIcon, UploadIcon, ReviewIcon, GenerateIcon, SparklesIcon, BriefcaseIcon } from './components/ui/Icons';
import Button from './components/ui/Button';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  
  const [components, setComponents] = useState<ImageComponent[]>([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  
  const [lblVariations, setLblVariations] = useState<LBLVariation[]>([]);
  const [reconstructingVariationIndex, setReconstructingVariationIndex] = useState<number | null>(null);
  const [currentPageCount, setCurrentPageCount] = useState<number>(4);

  // New state for features
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [isBrandKitModalOpen, setIsBrandKitModalOpen] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<ImageComponent | null>(null);

  const handleFilesChange = (selectedFiles: File[]) => {
    if (selectedFiles.length < 5 || selectedFiles.length > 10) {
      setError('Please upload between 5 and 10 files.');
      return;
    }
    setError(null);
    setFiles(Array.from(selectedFiles));
    setAppState('files_uploaded');
  };

  const processFiles = useCallback(async () => {
    setAppState('processing');
    setError(null);
    setComponents([]);
    let allImages: { file: File; base64: string; mimeType: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingMessage(`Processing file ${i + 1} of ${files.length}: ${file.name}`);
        if (file.type === 'application/pdf') {
          const pdfImages = await processPdf(file);
          allImages.push(...pdfImages.map(img => ({ ...img, file })));
        } else if (file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          allImages.push({ file, base64, mimeType: file.type });
        }
      }

      setProcessingMessage(`Analyzing ${allImages.length} images with AI...`);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const analysisPromises = allImages.map((img, index) => 
        analyzeAndCategorizeImage(ai, img.base64, img.mimeType)
          .then(newComponents => newComponents.map(c => ({
            ...c,
            id: `comp-${index}-${Math.random().toString(36).substring(2, 9)}`,
            base64: img.base64,
            mimeType: img.mimeType,
          })))
      );
      
      const componentArrays = await Promise.all(analysisPromises);
      const flattenedComponents = componentArrays.flat();

      setComponents(flattenedComponents);
      setAppState('components_extracted');
    } catch (err) {
      console.error(err);
      setError(`An error occurred during processing. Please check the console. Details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAppState('error');
    } finally {
      setProcessingMessage('');
    }
  }, [files]);

  const handleGenerateVariations = async (pageCount: number) => {
    if (selectedComponentIds.length === 0) {
      setError('Please select at least one component to generate an LBL.');
      return;
    }
    setAppState('generating');
    setCurrentPageCount(pageCount);
    setError(null);
    setLblVariations([]);

    try {
      const selectedComponents = components.filter(c => selectedComponentIds.includes(c.id));
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
      }
      const ai = new GoogleGenAI({ apiKey });
      const variations = await generateLBLVariations(ai, selectedComponents, pageCount, brandKit ?? undefined);
      setLblVariations(variations);
      setAppState('variations_generated');
    } catch (err) {
      console.error(err);
      setError(`Failed to generate LBL variations. Please try again. Details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAppState('components_extracted'); // Go back to the previous step on error
    }
  };
  
  const handleReconstructLBL = async (variationIndex: number) => {
    const variationToReconstruct = lblVariations[variationIndex];
    if (!variationToReconstruct) return;

    setReconstructingVariationIndex(variationIndex);
    setError(null);

    try {
        const componentsForVariation = variationToReconstruct.orderedComponentIds
            .map(id => components.find(c => c.id === id))
            .filter((c): c is ImageComponent => c !== undefined);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
        }
        const ai = new GoogleGenAI({ apiKey });
        const reconstructedImage = await reconstructLBLImage(ai, variationToReconstruct, componentsForVariation, currentPageCount, brandKit ?? undefined);
        
        setLblVariations(currentVariations => 
            currentVariations.map((v, index) => 
                index === variationIndex 
                    ? { ...v, reconstructedImage } 
                    : v
            )
        );

    } catch (err) {
        console.error(err);
        setError(`Failed to reconstruct LBL. Please try again. Details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setReconstructingVariationIndex(null);
    }
  };

  const handleSaveBrandKit = (newBrandKit: BrandKit) => {
    setBrandKit(newBrandKit);
    setIsBrandKitModalOpen(false);
  };

  const handleSaveComponent = (editedComponent: ImageComponent) => {
    setComponents(prev => prev.map(c => c.id === editedComponent.id ? editedComponent : c));
    setComponentToEdit(null);
  };

  const handleReset = () => {
    setAppState('idle');
    setFiles([]);
    setError(null);
    setProcessingMessage('');
    setComponents([]);
    setSelectedComponentIds([]);
    setLblVariations([]);
    setCurrentPageCount(4);
    setReconstructingVariationIndex(null);
    // Do not reset brand kit
  };

  const Stepper = () => {
    const steps = [
      { name: 'Upload Files', state: 'idle', icon: <UploadIcon /> },
      { name: 'Review & Select Components', state: 'components_extracted', icon: <ReviewIcon /> },
      { name: 'Generate LBL Variations', state: 'variations_generated', icon: <GenerateIcon /> }
    ];
    const currentStepIndex = appState === 'idle' || appState === 'files_uploaded' ? 0 : appState === 'components_extracted' || appState === 'generating' ? 1 : 2;

    return (
        <ol className="flex items-center w-full">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                    <li key={step.name} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${isCompleted ? 'after:border-brand-blue' : 'after:border-base-300'}`}>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${isCurrent ? 'bg-brand-blue' : isCompleted ? 'bg-brand-secondary' : 'bg-base-300'}`}>
                            {React.cloneElement(step.icon, { className: 'w-5 h-5 text-white lg:w-6 lg:h-6' })}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};
  
  return (
    <>
      <div className="min-h-screen bg-base-200 font-sans text-text-primary">
        <header className="bg-base-100/80 backdrop-blur-lg sticky top-0 z-50 shadow-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4 border-b border-base-300">
                  <div className="flex items-center space-x-3">
                      <div className="bg-brand-blue p-2 rounded-lg">
                          <BrandIcon />
                      </div>
                      <div>
                          <h1 className="text-xl font-bold text-brand-blue tracking-tight">
                          Pharma LBL Generator
                          </h1>
                          <p className="text-xs text-text-secondary">AI-Powered Marketing Asset Generation</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button onClick={() => setIsBrandKitModalOpen(true)} variant="secondary">
                        <BriefcaseIcon /> Brand Kit
                    </Button>
                    {(appState !== 'idle' && appState !== 'files_uploaded') && (
                        <Button onClick={handleReset} variant="secondary">
                            Start Over
                        </Button>
                    )}
                  </div>
              </div>
              {(appState !== 'idle' && appState !== 'files_uploaded' && appState !== 'processing') && (
                  <div className="py-4">
                      <Stepper />
                  </div>
              )}
          </div>
        </header>
        
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {appState === 'idle' || appState === 'files_uploaded' ? (
            <FileUpload onFilesChange={handleFilesChange} files={files} onProcess={processFiles} disabled={files.length === 0} />
          ) : appState === 'processing' ? (
            <div className="text-center p-12 bg-base-100 rounded-xl shadow-medium">
              <div className="flex justify-center items-center">
                  <SparklesIcon className="text-brand-accent w-16 h-16" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-brand-blue">{processingMessage}</h2>
              <p className="text-text-secondary mt-2 max-w-2xl mx-auto">Our AI is deconstructing your LBLs into categorized components. This may take a few moments depending on the number and complexity of your files.</p>
              <div className="w-full bg-base-300 rounded-full h-2.5 mt-6 max-w-md mx-auto">
                  <div className="bg-brand-blue h-2.5 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          ) : appState === 'components_extracted' || appState === 'generating' ? (
            <ComponentGallery 
              components={components} 
              selectedComponentIds={selectedComponentIds}
              setSelectedComponentIds={setSelectedComponentIds}
              onGenerate={handleGenerateVariations}
              isLoading={appState === 'generating'}
              onEditComponent={setComponentToEdit}
            />
          ) : appState === 'variations_generated' ? (
            <LBLVariationsDisplay 
              variations={lblVariations} 
              components={components} 
              onReset={handleReset}
              onReconstruct={handleReconstructLBL}
              reconstructingIndex={reconstructingVariationIndex}
              pageCount={currentPageCount}
            />
          ) : null}
        </main>
      </div>

      <BrandKitModal
        isOpen={isBrandKitModalOpen}
        onClose={() => setIsBrandKitModalOpen(false)}
        onSave={handleSaveBrandKit}
        initialBrandKit={brandKit}
      />

      {componentToEdit && (
        <ComponentEditModal
            isOpen={!!componentToEdit}
            onClose={() => setComponentToEdit(null)}
            component={componentToEdit}
            onSave={handleSaveComponent}
        />
      )}
    </>
  );
};

export default App;