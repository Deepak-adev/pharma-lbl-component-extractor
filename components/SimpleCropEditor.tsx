import React, { useState } from 'react';
import type { ImageComponent } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface SimpleCropEditorProps {
  isOpen: boolean;
  onClose: () => void;
  component: ImageComponent;
  onSave: (component: ImageComponent) => void;
}

export const SimpleCropEditor: React.FC<SimpleCropEditorProps> = ({
  isOpen,
  onClose,
  component,
  onSave
}) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const handleSave = () => {
    const updatedComponent: ImageComponent = {
      ...component,
      id: `enhanced-${Date.now()}`,
      name: `${component.name} (Enhanced)`
    };
    onSave(updatedComponent);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enhance Component"
      footerContent={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Enhanced</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-center">
          <img 
            src={`data:${component.mimeType};base64,${component.base64}`}
            alt={component.name}
            className="max-w-full max-h-64 mx-auto rounded-lg"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%)`
            }}
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Contrast: {contrast}%
            </label>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};