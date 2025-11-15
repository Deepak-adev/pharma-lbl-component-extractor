import React, { useState, useMemo } from 'react';
import type { ImageComponent, ComponentCategory } from '../types';

interface ComponentGalleryProps {
  components: ImageComponent[];
  selectedComponentIds: string[];
  setSelectedComponentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerate: (pageCount: number) => void;
  isLoading: boolean;
  onEditComponent: (component: ImageComponent) => void;
  onCropComponent?: (component: ImageComponent) => void;
}

const ComponentGallery: React.FC<ComponentGalleryProps> = ({ 
  components, 
  selectedComponentIds, 
  setSelectedComponentIds, 
  onGenerate, 
  isLoading, 
  onEditComponent, 
  onCropComponent 
}) => {
  const [filter, setFilter] = useState<ComponentCategory | 'All'>('All');

  const categories = useMemo(() => {
    const uniqueCategories = new Set(components.map(c => c.category));
    return ['All', ...Array.from(uniqueCategories).sort()] as (ComponentCategory | 'All')[];
  }, [components]);

  const filteredComponents = useMemo(() => {
    if (filter === 'All') return components;
    return components.filter(c => c.category === filter);
  }, [components, filter]);

  const toggleSelection = (id: string) => {
    setSelectedComponentIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">
      <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-32">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            🔍 Filter Components
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  filter === category 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {selectedComponentIds.length} Components Selected
            </h3>
            <div className="bg-blue-100 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-blue-900">Single Page LBL</p>
              <p className="text-xs text-blue-700">Generates precise pharmaceutical LBL matching your original design</p>
            </div>
            <button 
              onClick={() => onGenerate(1)} 
              disabled={isLoading || selectedComponentIds.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading || selectedComponentIds.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </span>
              ) : (
                'Generate Precise LBL ✨'
              )}
            </button>
          </div>
        </div>
      </aside>

      <main>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Component Library</h2>
          <p className="text-gray-600">AI has extracted <span className="font-semibold text-blue-600">{components.length} components</span>. Select the building blocks for your new LBL.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComponents.map(component => {
            const isSelected = selectedComponentIds.includes(component.id);
            return (
              <div key={component.id} className="relative group">
                <div 
                  onClick={() => toggleSelection(component.id)}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 overflow-hidden cursor-pointer transform hover:-translate-y-1 hover:shadow-lg ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-48 bg-white border border-gray-200 flex items-center justify-center p-2 relative overflow-hidden">
                    <img 
                      src={`data:${component.mimeType};base64,${component.base64}`} 
                      alt={component.name} 
                      className="max-w-full max-h-full object-contain"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                      {Math.round((component as any).boundingBox?.width || 0)}×{Math.round((component as any).boundingBox?.height || 0)}%
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block text-xs bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-full mb-2">
                      {component.category}
                    </span>
                    <h4 className="font-semibold text-sm text-gray-900 truncate mb-1" title={component.name}>
                      {component.name}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2" title={component.description}>
                      {component.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      📐 {Math.round((component as any).boundingBox?.x || 0)},{Math.round((component as any).boundingBox?.y || 0)} • {Math.round((component as any).boundingBox?.width || 0)}×{Math.round((component as any).boundingBox?.height || 0)}%
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditComponent(component);
                    }}
                    className="w-6 h-6 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label={`Edit ${component.name}`}
                  >
                    <span className="text-xs">✏️</span>
                  </button>
                  {onCropComponent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCropComponent(component);
                      }}
                      className="w-6 h-6 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                      aria-label={`Crop ${component.name}`}
                    >
                      <span className="text-xs">✂️</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ComponentGallery;