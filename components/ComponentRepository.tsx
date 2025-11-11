import React, { useState, useMemo } from 'react';
import type { ImageComponent, ComponentCategory } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { SearchIcon, FilterIcon, TrashIcon, EditIcon, DatabaseIcon } from './ui/Icons';

interface ComponentRepositoryProps {
  components: ImageComponent[];
  onEditComponent: (component: ImageComponent) => void;
  onDeleteComponent: (componentId: string) => void;
  onSelectComponents: (componentIds: string[]) => void;
  selectedComponentIds: string[];
}

const ComponentRepository: React.FC<ComponentRepositoryProps> = ({
  components,
  onEditComponent,
  onDeleteComponent,
  onSelectComponents,
  selectedComponentIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'date'>('name');

  const categories = useMemo(() => {
    const uniqueCategories = new Set(components.map(c => c.category));
    return ['All', ...Array.from(uniqueCategories).sort()] as (ComponentCategory | 'All')[];
  }, [components]);

  const filteredAndSortedComponents = useMemo(() => {
    let filtered = components;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
          return a.id.localeCompare(b.id); // Using ID as proxy for creation date
        default:
          return 0;
      }
    });

    return filtered;
  }, [components, searchTerm, categoryFilter, sortBy]);

  const toggleSelection = (componentId: string) => {
    const newSelection = selectedComponentIds.includes(componentId)
      ? selectedComponentIds.filter(id => id !== componentId)
      : [...selectedComponentIds, componentId];
    onSelectComponents(newSelection);
  };

  const selectAll = () => {
    onSelectComponents(filteredAndSortedComponents.map(c => c.id));
  };

  const clearSelection = () => {
    onSelectComponents([]);
  };

  return (
    <div className="bg-base-100 p-6 rounded-xl shadow-medium">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DatabaseIcon className="w-8 h-8 text-brand-blue" />
          <div>
            <h2 className="text-2xl font-bold text-brand-blue">Component Repository</h2>
            <p className="text-text-secondary">
              {components.length} components stored • {selectedComponentIds.length} selected
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={selectAll} size="small">
            Select All ({filteredAndSortedComponents.length})
          </Button>
          <Button variant="ghost" onClick={clearSelection} size="small">
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-md focus:ring-brand-blue focus:border-brand-blue"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ComponentCategory | 'All')}
            className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-md focus:ring-brand-blue focus:border-brand-blue bg-white appearance-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'date')}
          className="w-full px-4 py-2 border border-base-300 rounded-md focus:ring-brand-blue focus:border-brand-blue bg-white"
        >
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
          <option value="date">Sort by Date Added</option>
        </select>
      </div>

      {/* Components Grid */}
      {filteredAndSortedComponents.length === 0 ? (
        <div className="text-center py-12">
          <DatabaseIcon className="w-16 h-16 text-base-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {components.length === 0 ? 'No Components Yet' : 'No Matching Components'}
          </h3>
          <p className="text-text-secondary">
            {components.length === 0 
              ? 'Upload some LBL files to start building your component library.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAndSortedComponents.map(component => {
            const isSelected = selectedComponentIds.includes(component.id);
            return (
              <div key={component.id} className="relative group">
                <Card 
                  onClick={() => toggleSelection(component.id)}
                  className={`transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'ring-2 ring-brand-secondary shadow-medium' 
                      : 'hover:shadow-medium hover:-translate-y-1'
                  }`}
                >
                  <div className="h-32 bg-base-200 flex items-center justify-center p-2">
                    <img 
                      src={`data:${component.mimeType};base64,${component.base64}`} 
                      alt={component.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="p-3 border-t border-base-300">
                    <span className="text-xs bg-brand-blue-light text-brand-blue font-bold px-2 py-1 rounded-full">
                      {component.category}
                    </span>
                    <h4 className="font-bold mt-2 text-sm text-text-primary truncate" title={component.name}>
                      {component.name}
                    </h4>
                    <p className="text-xs text-text-secondary h-6 overflow-hidden" title={component.description}>
                      {component.description}
                    </p>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditComponent(component);
                    }}
                    className="bg-white shadow-md"
                  >
                    <EditIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComponent(component.id);
                    }}
                    className="bg-white shadow-md text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </Button>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-brand-secondary text-white rounded-full p-1">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComponentRepository;