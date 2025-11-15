import React, { useState } from 'react';
import type { LBLVariation, ImageComponent } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { ArrowRightIcon, DownloadIcon, DownloadAllIcon, EditIcon, TrashIcon } from './ui/Icons';
import { LBLReconstructionEditor } from './LBLReconstructionEditor';
import { downloadPagesAsPDF, downloadSinglePageAsPDF } from '../utils/pdfUtils';

interface LBLVariationsDisplayProps {
  variations: LBLVariation[];
  components: ImageComponent[];
  onReset: () => void;
  onReconstruct: (index: number) => void;
  reconstructingIndex: number | null;
  pageCount: number;
  onEditComponent?: (component: ImageComponent) => void;
  onEditLBL?: (variation: LBLVariation) => void;
  onSaveLBL?: (variation: any, index: number) => void;
  onEditInline?: (index: number) => void;
  onSaveEdit?: (index: number, title: string, description: string) => void;
  onUpdateVariation?: (index: number, updatedVariation: LBLVariation) => void;
  onDeleteComponent?: (variationIndex: number, componentIndex: number) => void;
  editingIndex?: number | null;
}

const LBLVariationsDisplay: React.FC<LBLVariationsDisplayProps> = ({ variations, components, onReset, onReconstruct, reconstructingIndex, pageCount, onEditComponent, onEditLBL, onSaveLBL, onEditInline, onSaveEdit, onUpdateVariation, onDeleteComponent, editingIndex }) => {
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editingReconstructionIndex, setEditingReconstructionIndex] = useState<number | null>(null);
  const getComponentById = (id: string) => components.find(c => c.id === id);

  const handleDownload = (base64Image: string, title: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Image}`;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_lbl.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (variation: LBLVariation) => {
    if (variation.reconstructedPages) {
      downloadPagesAsPDF(variation.reconstructedPages, variation.title);
    } else if (variation.reconstructedImage) {
      downloadSinglePageAsPDF(variation.reconstructedImage, variation.title, 1);
    }
  };

  const handleDownloadPagePDF = (pageBase64: string, title: string, pageNumber: number) => {
    downloadSinglePageAsPDF(pageBase64, title, pageNumber);
  };

  const handleDownloadAll = () => {
    const completedVariations = variations.filter(v => v.reconstructedImage);
    if (completedVariations.length === 0) return;

    completedVariations.forEach((variation, index) => {
      setTimeout(() => {
        handleDownload(variation.reconstructedImage!, `${variation.title}_${index + 1}`);
      }, index * 500); // Stagger downloads by 500ms
    });
  };

  return (
    <div>
        <div className="bg-base-100 p-6 rounded-xl shadow-medium mb-8">
            <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                    <h2 className="text-3xl font-bold text-brand-blue">LBL Strategy Variations</h2>
                    <p className="text-text-secondary mt-1 max-w-3xl mx-auto">Here are AI-generated layout concepts for your pharmaceutical materials. Each variation shows the page count and type. Review each strategy and click to generate a full visual mock-up.</p>
                </div>
                {variations.some(v => v.reconstructedImage) && (
                    <div className="ml-6">
                        <Button 
                            onClick={handleDownloadAll}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <DownloadAllIcon className="w-4 h-4" />
                            Download All ({variations.filter(v => v.reconstructedImage).length})
                        </Button>
                    </div>
                )}
            </div>
        </div>

      <div className="space-y-8">
        {variations.map((variation, index) => (
          <Card key={index} className="overflow-hidden shadow-medium">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-blue-600">Variation {index + 1}</span>
                    {variation.pageCount && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        {variation.pageCount}-pager
                      </span>
                    )}
                    {variation.lblType && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        {variation.lblType}
                      </span>
                    )}
                  </div>
                  {editingIndex === index ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold"
                        placeholder="LBL Title"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                        placeholder="LBL Description"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onSaveEdit?.(index, editTitle, editDescription);
                            setEditTitle('');
                            setEditDescription('');
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => onEditInline?.(-1)}
                          className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{variation.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{variation.description}</p>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  {editingIndex !== index && (
                    <>
                      <button
                        onClick={() => {
                          setEditTitle(variation.title);
                          setEditDescription(variation.description);
                          onEditInline?.(index);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit Info
                      </button>
                      {!variation.reconstructedImage && (
                        <button
                          onClick={() => setEditingReconstructionIndex(editingReconstructionIndex === index ? null : index)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          🔧 Edit Flow
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-base-200 p-6 border-t border-base-300">
                {variation.reconstructedImage ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-sm text-text-primary">Reconstructed LBL Mockup:</h4>
                            <div className="flex gap-2">
                                {onEditLBL && (
                                    <Button 
                                        onClick={() => onEditLBL(variation)}
                                        variant="secondary"
                                        size="small"
                                    >
                                        ✏️ Edit LBL
                                    </Button>
                                )}
                                <Button 
                                    onClick={() => handleDownload(variation.reconstructedImage!, variation.title)}
                                    variant="secondary"
                                    size="small"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    PNG
                                </Button>
                                <Button 
                                    onClick={() => handleDownloadPDF(variation)}
                                    variant="secondary"
                                    size="small"
                                >
                                    📄 PDF
                                </Button>
                                {onSaveLBL && (
                                    <Button 
                                        onClick={() => onSaveLBL(variation, index)}
                                        variant="secondary"
                                        size="small"
                                    >
                                        🛒 Add to Cart
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg shadow-inner">
                            {variation.reconstructedPages ? (
                                <div className="space-y-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        {variation.reconstructedPages.length} pages generated
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {variation.reconstructedPages.map((pageImage, pageIndex) => (
                                            <div key={pageIndex} className="border border-base-300 rounded-md overflow-hidden group">
                                                <div className="bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 flex justify-between items-center">
                                                    <span>Page {pageIndex + 1}</span>
                                                    <button
                                                        onClick={() => handleDownloadPagePDF(pageImage, variation.title, pageIndex + 1)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800"
                                                        title="Download this page as PDF"
                                                    >
                                                        📄
                                                    </button>
                                                </div>
                                                <img 
                                                    src={`data:image/png;base64,${pageImage}`}
                                                    alt={`Page ${pageIndex + 1} of ${variation.title}`}
                                                    className="w-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <img 
                                    src={`data:image/png;base64,${variation.reconstructedImage!}`}
                                    alt={`Reconstructed LBL for ${variation.title}`}
                                    className="w-full max-w-2xl mx-auto border border-base-300 rounded-md"
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        {editingReconstructionIndex === index ? (
                            <LBLReconstructionEditor
                                variation={variation}
                                components={components}
                                allComponents={components}
                                onUpdateVariation={(updatedVariation) => {
                                    onUpdateVariation?.(index, updatedVariation);
                                }}
                                onReconstruct={() => {
                                    setEditingReconstructionIndex(null);
                                    onReconstruct(index);
                                }}
                                onAddComponent={(component) => {
                                    // Handle adding new component
                                }}
                                isReconstructing={reconstructingIndex === index}
                            />
                        ) : (
                            <>
                                <h4 className="font-semibold text-sm mb-4 text-text-primary">Visual Component Flow:</h4>
                                <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-6">
                                    {variation.orderedComponentIds.map((id, vIndex) => {
                                        const component = getComponentById(id);
                                        if (!component) return null;
                                        return (
                                            <React.Fragment key={`${id}-${vIndex}`}>
                                                <div className="flex flex-col items-center text-center w-24 shrink-0 group">
                                                    <div className="w-20 h-20 object-contain bg-base-100 rounded-md border shadow-sm flex items-center justify-center p-1 relative">
                                                        <img src={`data:${component.mimeType};base64,${component.base64}`} alt={component.name} className="max-w-full max-h-full" />
                                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {onEditComponent && (
                                                                <button
                                                                    onClick={() => onEditComponent(component)}
                                                                    className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-700"
                                                                >
                                                                    <EditIcon className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                            {onDeleteComponent && (
                                                                <button
                                                                    onClick={() => onDeleteComponent(index, vIndex)}
                                                                    className="w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                                                                >
                                                                    <TrashIcon className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
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
                                            <><Spinner/> Generating LBL...</>
                                        ) : (
                                            `Generate LBL`
                                        )}
                                    </Button>
                                    {reconstructingIndex === index && (
                                        <div className="mt-4 text-center">
                                            <div className="text-xs text-text-secondary mb-2">
                                                Gemini AI: Generating professional pharmaceutical design...
                                            </div>
                                            <div className="w-full bg-base-300 rounded-full h-2 max-w-md mx-auto">
                                                <div className="bg-brand-blue h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
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