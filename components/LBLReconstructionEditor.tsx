import React, { useState } from 'react';
import type { LBLVariation, ImageComponent } from '../types';
import Button from './ui/Button';
import { ArrowRightIcon, TrashIcon, PlusIcon, UploadIcon } from './ui/Icons';

interface LBLReconstructionEditorProps {
  variation: LBLVariation;
  components: ImageComponent[];
  allComponents: ImageComponent[];
  onUpdateVariation: (updatedVariation: LBLVariation) => void;
  onReconstruct: () => void;
  onAddComponent: (component: ImageComponent) => void;
  isReconstructing?: boolean;
}

export const LBLReconstructionEditor: React.FC<LBLReconstructionEditorProps> = ({
  variation,
  components,
  allComponents,
  onUpdateVariation,
  onReconstruct,
  onAddComponent,
  isReconstructing = false
}) => {
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getComponentById = (id: string) => components.find(c => c.id === id);
  
  const availableComponents = allComponents.filter(
    comp => !variation.orderedComponentIds.includes(comp.id)
  );

  const handleDeleteComponent = (index: number) => {
    const updatedIds = variation.orderedComponentIds.filter((_, i) => i !== index);
    onUpdateVariation({
      ...variation,
      orderedComponentIds: updatedIds,
      reconstructedImage: undefined // Clear reconstructed image when components change
    });
  };

  const handleAddExistingComponent = (componentId: string) => {
    const updatedIds = [...variation.orderedComponentIds, componentId];
    onUpdateVariation({
      ...variation,
      orderedComponentIds: updatedIds,
      reconstructedImage: undefined
    });
    setShowComponentLibrary(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const updatedIds = [...variation.orderedComponentIds];
    const draggedId = updatedIds[draggedIndex];
    updatedIds.splice(draggedIndex, 1);
    updatedIds.splice(dropIndex, 0, draggedId);

    onUpdateVariation({
      ...variation,
      orderedComponentIds: updatedIds,
      reconstructedImage: undefined
    });
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-900">Edit Component Flow</h4>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowComponentLibrary(!showComponentLibrary)}
            variant="secondary"
            size="small"
          >
            <PlusIcon className="w-4 h-4" />
            Add Component
          </Button>
        </div>
      </div>

      {/* Component Flow Editor */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {variation.orderedComponentIds.map((id, index) => {
            const component = getComponentById(id);
            if (!component) return null;

            return (
              <React.Fragment key={`${id}-${index}`}>
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="relative group cursor-move"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-2 hover:border-blue-400 transition-colors">
                    <img
                      src={`data:${component.mimeType};base64,${component.base64}`}
                      alt={component.name}
                      className="max-w-full max-h-16 object-contain"
                    />
                    <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                      {component.name}
                    </p>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteComponent(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
                
                {index < variation.orderedComponentIds.length - 1 && (
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
          
          {/* Add component placeholder */}
          <div
            onClick={() => setShowComponentLibrary(true)}
            className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Component Library */}
      {showComponentLibrary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-medium text-gray-900">Available Components</h5>
            <button
              onClick={() => setShowComponentLibrary(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-64 overflow-y-auto">
            {availableComponents.map(component => (
              <div
                key={component.id}
                onClick={() => handleAddExistingComponent(component.id)}
                className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <img
                  src={`data:${component.mimeType};base64,${component.base64}`}
                  alt={component.name}
                  className="max-w-full max-h-12 object-contain"
                />
                <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                  {component.name}
                </p>
              </div>
            ))}
          </div>
          
          {availableComponents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No additional components available</p>
              <p className="text-sm">Upload more files to add components</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Tips:</strong> Drag components to reorder • Click ✕ to remove • Click + to add components • Changes require regeneration
        </p>
      </div>

      {/* Reconstruct Button */}
      <div className="text-center">
        <Button
          onClick={onReconstruct}
          disabled={isReconstructing || variation.orderedComponentIds.length === 0}
          size="large"
          className="w-full"
        >
          {isReconstructing ? (
            <>🔄 Regenerating LBL...</>
          ) : (
            <>🎨 Generate Updated LBL</>
          )}
        </Button>
      </div>
    </div>
  );
};