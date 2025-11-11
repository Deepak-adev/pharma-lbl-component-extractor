import React, { useState } from 'react';
import Button from './ui/Button';
import { Icons } from './ui/Icons';

export interface LBLType {
  id: string;
  name: string;
  description: string;
  icon: string;
  variations: number;
  pageCount: number;
}

interface LBLTypeSelectorProps {
  onSelectionChange: (selectedTypes: LBLType[]) => void;
  onGenerate: (selectedTypes: LBLType[], instructions: string) => void;
  isLoading?: boolean;
}

const availableLBLTypes: Omit<LBLType, 'variations'>[] = [
  {
    id: 'product-detail',
    name: 'Product Detail Aid',
    description: 'Comprehensive product information with clinical data',
    icon: '📋'
  },
  {
    id: 'patient-brochure',
    name: 'Patient Brochure',
    description: 'Patient-friendly educational materials',
    icon: '👥'
  },
  {
    id: 'prescriber-guide',
    name: 'Prescriber Guide',
    description: 'Healthcare professional reference materials',
    icon: '👨‍⚕️'
  },
  {
    id: 'sales-aid',
    name: 'Sales Aid',
    description: 'Sales representative presentation materials',
    icon: '💼'
  },
  {
    id: 'clinical-summary',
    name: 'Clinical Summary',
    description: 'Evidence-based clinical data presentation',
    icon: '🔬'
  },
  {
    id: 'safety-profile',
    name: 'Safety Profile',
    description: 'Safety and adverse event information',
    icon: '⚠️'
  },
  {
    id: 'mechanism-action',
    name: 'Mechanism of Action',
    description: 'Scientific explanation of drug mechanism',
    icon: '🧬'
  },
  {
    id: 'dosing-guide',
    name: 'Dosing Guide',
    description: 'Dosage and administration instructions',
    icon: '💊'
  }
];

export const LBLTypeSelector: React.FC<LBLTypeSelectorProps> = ({
  onSelectionChange,
  onGenerate,
  isLoading = false
}) => {
  const [selectedTypes, setSelectedTypes] = useState<LBLType[]>([]);
  const [instructions, setInstructions] = useState('');

  const handleTypeToggle = (type: Omit<LBLType, 'variations' | 'pageCount'>) => {
    const isSelected = selectedTypes.some(t => t.id === type.id);
    
    if (isSelected) {
      const updated = selectedTypes.filter(t => t.id !== type.id);
      setSelectedTypes(updated);
      onSelectionChange(updated);
    } else {
      const updated = [...selectedTypes, { ...type, variations: 3, pageCount: 4 }];
      setSelectedTypes(updated);
      onSelectionChange(updated);
    }
  };

  const handleVariationChange = (typeId: string, variations: number) => {
    const updated = selectedTypes.map(type =>
      type.id === typeId ? { ...type, variations } : type
    );
    setSelectedTypes(updated);
    onSelectionChange(updated);
  };

  const handlePageCountChange = (typeId: string, pageCount: number) => {
    const updated = selectedTypes.map(type =>
      type.id === typeId ? { ...type, pageCount } : type
    );
    setSelectedTypes(updated);
    onSelectionChange(updated);
  };

  const handleGenerate = () => {
    if (selectedTypes.length > 0) {
      onGenerate(selectedTypes, instructions);
    }
  };

  const totalVariations = selectedTypes.reduce((sum, type) => sum + type.variations, 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-brand-blue mb-2">Select LBL Types</h3>
        <p className="text-gray-600 text-sm">Choose the types of pharmaceutical materials you want to generate</p>
      </div>

      {/* LBL Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {availableLBLTypes.map(type => {
          const isSelected = selectedTypes.some(t => t.id === type.id);
          const selectedType = selectedTypes.find(t => t.id === type.id);
          
          return (
            <div
              key={type.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-brand-blue bg-brand-blue-light'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleTypeToggle(type)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{type.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  
                  {isSelected && (
                    <div className="mt-3 space-y-3" onClick={e => e.stopPropagation()}>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Page Count: {selectedType?.pageCount || 4}-pager
                        </label>
                        <div className="flex gap-1 flex-wrap">
                          {[2, 4, 6, 8, 10, 12].map(num => (
                            <button
                              key={num}
                              onClick={() => handlePageCountChange(type.id, num)}
                              className={`px-2 py-1 text-xs rounded border ${
                                selectedType?.pageCount === num
                                  ? 'bg-brand-blue text-white border-brand-blue'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-blue'
                              }`}
                            >
                              {num}p
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Variations: {selectedType?.variations || 3}
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              onClick={() => handleVariationChange(type.id, num)}
                              className={`w-8 h-8 text-xs rounded border ${
                                selectedType?.variations === num
                                  ? 'bg-brand-blue text-white border-brand-blue'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-blue'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Instructions Box */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Detailed Generation Instructions
        </label>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Better Results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Target Audience:</strong> Specify if for HCPs, patients, or sales teams</li>
            <li>• <strong>Therapeutic Area:</strong> Mention specific indication (oncology, cardiology, etc.)</li>
            <li>• <strong>Brand Guidelines:</strong> Include color preferences, tone, and style</li>
            <li>• <strong>Regulatory:</strong> Note any compliance requirements or warnings needed</li>
            <li>• <strong>Key Messages:</strong> Highlight main points to emphasize</li>
          </ul>
        </div>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="📋 Detailed Instructions:\n\n🎯 Target Audience: [Healthcare professionals/Patients/Sales team]\n🏥 Therapeutic Area: [Oncology/Cardiology/Neurology/etc.]\n🎨 Brand Guidelines: [Colors, fonts, style preferences]\n⚠️ Regulatory Requirements: [Safety warnings, disclaimers]\n💡 Key Messages: [Main points to highlight]\n📄 Content Focus: [Clinical data/Patient benefits/Mechanism of action]\n\nExample: 'Create oncology-focused materials for HCPs. Use professional blue/white color scheme. Emphasize safety profile and efficacy data. Include prominent adverse event warnings. Target prescribers in hospital settings.'"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none font-mono text-sm"
          rows={8}
        />
        <div className="mt-2 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            💡 More detailed instructions = better, more targeted results
          </div>
          <div className="text-xs text-gray-400">
            {instructions.length}/2000 characters
          </div>
        </div>
      </div>

      {/* Summary and Generate */}
      {selectedTypes.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">Selected Types:</span>
            <span className="text-sm text-gray-600">{totalVariations} total variations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map(type => (
              <span
                key={type.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-blue text-white text-xs rounded-full"
              >
                {type.icon} {type.name} ({type.pageCount}p × {type.variations})
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={selectedTypes.length === 0 || isLoading}
        size="large"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Icons.Spinner className="w-4 h-4 animate-spin" />
            Generating {totalVariations} LBL Variations...
          </>
        ) : (
          <>
            <Icons.Sparkles className="w-4 h-4" />
            Generate {totalVariations} LBL Variations
          </>
        )}
      </Button>
    </div>
  );
};