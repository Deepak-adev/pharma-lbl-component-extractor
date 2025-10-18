import React, { useState, useMemo } from 'react';
import type { ImageComponent, ComponentCategory } from '../types';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import Button from './ui/Button';
import { CheckCircleIcon, FilterIcon, EditIcon } from './ui/Icons';

interface ComponentGalleryProps {
  components: ImageComponent[];
  selectedComponentIds: string[];
  setSelectedComponentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerate: (pageCount: number) => void;
  isLoading: boolean;
  onEditComponent: (component: ImageComponent) => void;
}

const ComponentGallery: React.FC<ComponentGalleryProps> = ({ components, selectedComponentIds, setSelectedComponentIds, onGenerate, isLoading, onEditComponent }) => {
  const [filter, setFilter] = useState<ComponentCategory | 'All'>('All');
  const [pageCount, setPageCount] = useState<number>(4);

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

  const pageOptions = [1, 2, 4, 6, 8];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
      {/* Sidebar */}
      <aside className="bg-base-100 p-6 rounded-xl shadow-medium sticky top-36">
        <div>
          <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
            <FilterIcon />
            Filter Components
          </h3>
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border-2 ${
                  filter === category ? 'bg-brand-blue text-white border-brand-blue' : 'bg-base-100 text-text-secondary border-base-300 hover:border-brand-secondary hover:text-brand-secondary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-base-300 pt-6">
            <h3 className="text-lg font-bold text-brand-blue mb-4">{selectedComponentIds.length} components selected</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-text-primary block mb-2">Page Count</label>
                    <div className="inline-flex rounded-md shadow-sm w-full" role="group">
                        {pageOptions.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setPageCount(opt)}
                                className={`px-4 py-2 text-sm font-medium border w-full ${opt === pageCount ? 'bg-brand-blue text-white z-10 ring-2 ring-brand-blue' : 'bg-white text-gray-900 hover:bg-gray-100'} first:rounded-l-lg last:rounded-r-lg`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <Button onClick={() => onGenerate(pageCount)} disabled={isLoading || selectedComponentIds.length === 0} size="large" className="w-full">
                {isLoading ? <><Spinner/> Generating...</> : `Generate 5 Variations`}
                </Button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main>
        <div className="bg-base-100 p-6 rounded-xl shadow-medium mb-8">
            <h2 className="text-2xl font-bold text-brand-blue">Component Library</h2>
            <p className="text-text-secondary mt-1">AI has extracted {components.length} components. Select the building blocks for your new LBL.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComponents.map(component => {
            const isSelected = selectedComponentIds.includes(component.id);
            return (
                <div key={component.id} className="relative group" >
                  <Card 
                    onClick={() => toggleSelection(component.id)}
                    className={`transition-all duration-200 overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-brand-secondary shadow-medium' : 'group-hover:shadow-medium group-hover:-translate-y-1'}`}>
                      <div className="h-40 bg-base-200 flex items-center justify-center p-2">
                          <img src={`data:${component.mimeType};base64,${component.base64}`} alt={component.name} className="max-w-full max-h-full object-contain"/>
                      </div>
                      <div className="p-4 border-t border-base-300">
                      <span className="text-xs bg-brand-blue-light text-brand-blue font-bold px-2 py-1 rounded-full">{component.category}</span>
                      <h4 className="font-bold mt-2 text-sm text-text-primary truncate" title={component.name}>{component.name}</h4>
                      <p className="text-xs text-text-secondary h-8 overflow-hidden" title={component.description}>{component.description}</p>
                      </div>
                  </Card>
                  <div className="absolute top-2 right-2">
                    {isSelected && (
                        <div className="text-brand-secondary bg-white rounded-full shadow-lg">
                          <CheckCircleIcon />
                        </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditComponent(component);
                        }}
                        aria-label={`Edit ${component.name}`}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                  </div>
                </div>
            )
          })}
        </div>
      </main>
    </div>
  );
};

export default ComponentGallery;