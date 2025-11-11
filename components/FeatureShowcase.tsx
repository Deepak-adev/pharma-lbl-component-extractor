import React, { useState } from 'react';
import { LBLTypeSelector, type LBLType } from './LBLTypeSelector';
import { AdvancedCropEditor } from './AdvancedCropEditor';
import type { ImageComponent } from '../types';
import Button from './ui/Button';
import { Icons } from './ui/Icons';

export const FeatureShowcase: React.FC = () => {
  const [showLBLSelector, setShowLBLSelector] = useState(false);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<LBLType[]>([]);

  // Demo component for cropping
  const demoComponent: ImageComponent = {
    id: 'demo-1',
    name: 'Demo Component',
    description: 'Sample pharmaceutical component for demonstration',
    category: 'Product Image (Packshot)',
    base64: '', // Would be populated with actual image data
    mimeType: 'image/jpeg'
  };

  const handleLBLGeneration = (types: LBLType[], instructions: string) => {
    console.log('Generated LBL types:', types);
    console.log('Instructions:', instructions);
    setShowLBLSelector(false);
  };

  const handleCropSave = (croppedComponent: ImageComponent) => {
    console.log('Saved cropped component:', croppedComponent);
    setShowCropEditor(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">New Features Showcase</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LBL Type Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.Layout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">LBL Type Selection</h3>
                <p className="text-sm text-gray-600">Choose specific pharmaceutical material types</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icons.Check className="w-4 h-4 text-green-600" />
                Multiple LBL types (Product Detail, Patient Brochure, etc.)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icons.Check className="w-4 h-4 text-green-600" />
                Customizable variation counts per type
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icons.Check className="w-4 h-4 text-green-600" />
                Generation instructions box for specific requirements
              </div>
            </div>
            
            <Button 
              onClick={() => setShowLBLSelector(true)}
              className="w-full"
              size="small"
            >
              <Icons.Sparkles className="w-4 h-4" />
              Try LBL Type Selector
            </Button>
          </div>

          {/* Advanced Cropping */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Icons.Image className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Advanced Cropping</h3>
                <p className="text-sm text-gray-600">AI-powered component cropping with enhancements</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icons.Check className="w-4 h-4 text-green-600" />
                Interactive drag-and-drop cropping interface
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icons.Check className="w-4 h-4 text-green-600" />
                Real-time image enhancement controls
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icons.Check className="w-4 h-4 text-green-600" />
                Preset crop ratios and precise coordinate input
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCropEditor(true)}
              className="w-full"
              size="small"
              variant="secondary"
            >
              <Icons.Settings className="w-4 h-4" />
              Try Advanced Cropping
            </Button>
          </div>
        </div>

        {/* Feature Benefits */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Key Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Targeted Generation</h4>
              <p className="text-xs text-gray-600">Generate specific pharmaceutical materials for different audiences</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">✂️</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Precision Cropping</h4>
              <p className="text-xs text-gray-600">Advanced cropping with enhancement tools for perfect components</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💾</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Component Library</h4>
              <p className="text-xs text-gray-600">Save and reuse enhanced components across projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* LBL Type Selector Modal */}
      {showLBLSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">LBL Type Selection Demo</h3>
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => setShowLBLSelector(false)}
                >
                  <Icons.X className="w-4 h-4" />
                </Button>
              </div>
              <LBLTypeSelector
                onSelectionChange={setSelectedTypes}
                onGenerate={handleLBLGeneration}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Crop Editor Modal */}
      {showCropEditor && (
        <AdvancedCropEditor
          isOpen={showCropEditor}
          onClose={() => setShowCropEditor(false)}
          originalImage="" // Demo would need actual image
          component={demoComponent}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
};