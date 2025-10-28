import React from 'react';
import type { LBLVariation, ImageComponent } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { ArrowRightIcon, DownloadIcon } from './ui/Icons';

interface LBLVariationsDisplayProps {
  variations: LBLVariation[];
  components: ImageComponent[];
  onReset: () => void;
  onReconstruct: (index: number) => void;
  reconstructingIndex: number | null;
  pageCount: number;
}

const LBLVariationsDisplay: React.FC<LBLVariationsDisplayProps> = ({ variations, components, onReset, onReconstruct, reconstructingIndex, pageCount }) => {
  const getComponentById = (id: string) => components.find(c => c.id === id);

  const handleDownload = (base64Image: string, title: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Image}`;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_lbl.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
        <div className="bg-base-100 p-6 rounded-xl shadow-medium mb-8 text-center">
            <h2 className="text-3xl font-bold text-brand-blue">LBL Strategy Variations</h2>
            <p className="text-text-secondary mt-1 max-w-3xl mx-auto">Here are 5 unique, AI-generated layout concepts for your new {pageCount}-pager LBL. Review each strategy and click to generate a full visual mock-up.</p>
        </div>

      <div className="space-y-8">
        {variations.map((variation, index) => (
          <Card key={index} className="overflow-hidden shadow-medium">
            <div className="p-6">
              <span className="font-bold text-sm text-brand-secondary">Variation {index + 1}</span>
              <h3 className="text-xl font-bold text-brand-blue mt-1">{variation.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{variation.description}</p>
            </div>
            
            <div className="bg-base-200 p-6 border-t border-base-300">
                {variation.reconstructedImage ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-sm text-text-primary">Reconstructed LBL Mockup:</h4>
                            <Button 
                                onClick={() => handleDownload(variation.reconstructedImage!, variation.title)}
                                variant="secondary"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Download LBL
                            </Button>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg shadow-inner">
                            <img 
                                src={`data:image/png;base64,${variation.reconstructedImage!}`}
                                alt={`Reconstructed LBL for ${variation.title}`}
                                className="w-full max-w-2xl mx-auto border border-base-300 rounded-md"
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <h4 className="font-semibold text-sm mb-4 text-text-primary">Visual Component Flow:</h4>
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-6">
                            {variation.orderedComponentIds.map((id, vIndex) => {
                                const component = getComponentById(id);
                                if (!component) return null;
                                return (
                                    <React.Fragment key={`${id}-${vIndex}`}>
                                        <div className="flex flex-col items-center text-center w-24 shrink-0">
                                            <div className="w-20 h-20 object-contain bg-base-100 rounded-md border shadow-sm flex items-center justify-center p-1">
                                                <img src={`data:${component.mimeType};base64,${component.base64}`} alt={component.name} className="max-w-full max-h-full" />
                                            </div>
                                            <p className="mt-2 text-xs text-text-secondary truncate w-full" title={component.name}>{component.name}</p>
                                        </div>
                                        {vIndex < variation.orderedComponentIds.length - 1 && <ArrowRightIcon className="w-5 h-5 text-base-300 shrink-0" />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="text-center">
                            <Button 
                                onClick={() => onReconstruct(index)} 
                                disabled={reconstructingIndex !== null}
                                size="large"
                            >
                                {reconstructingIndex === index ? (
                                    <><Spinner/> Generating High-Quality Image...</>
                                ) : (
                                    `Generate High-Quality LBL`
                                )}
                            </Button>
                            {reconstructingIndex === index && (
                                <div className="mt-4 text-center">
                                    <div className="text-xs text-text-secondary mb-2">
                                        AI Enhancement Pipeline: Generation → Restoration → Face Enhancement → Upscaling
                                    </div>
                                    <div className="w-full bg-base-300 rounded-full h-2 max-w-md mx-auto">
                                        <div className="bg-brand-blue h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LBLVariationsDisplay;