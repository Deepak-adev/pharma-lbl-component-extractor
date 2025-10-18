import React, { useState, useEffect } from 'react';
import type { ImageComponent, ComponentCategory } from '../types';
import { componentCategories } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface ComponentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: ImageComponent;
  onSave: (component: ImageComponent) => void;
}

const ComponentEditModal: React.FC<ComponentEditModalProps> = ({ isOpen, onClose, component, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComponentCategory>('Other');

  useEffect(() => {
    if (component) {
      setName(component.name);
      setDescription(component.description);
      setCategory(component.category);
    }
  }, [component]);

  const handleSave = () => {
    onSave({ ...component, name, description, category });
  };
  
  const InputLabel: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary mb-1">{children}</label>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Component"
      footerContent={
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-base-200 rounded-lg border border-base-300 flex items-center justify-center p-2">
                <img 
                    src={`data:${component.mimeType};base64,${component.base64}`} 
                    alt={component.name} 
                    className="max-w-full max-h-full object-contain"
                />
            </div>
        </div>
        <div className="space-y-4">
          <div>
            <InputLabel htmlFor="componentName">Component Name</InputLabel>
            <input
              id="componentName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <InputLabel htmlFor="componentDescription">Description</InputLabel>
            <textarea
              id="componentDescription"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <InputLabel htmlFor="componentCategory">Category</InputLabel>
            <select
              id="componentCategory"
              value={category}
              onChange={e => setCategory(e.target.value as ComponentCategory)}
              className="w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-white"
            >
              {componentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ComponentEditModal;