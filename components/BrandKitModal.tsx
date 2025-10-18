import React, { useState, useEffect } from 'react';
import type { BrandKit } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandKit: BrandKit) => void;
  initialBrandKit: BrandKit | null;
}

const BrandKitModal: React.FC<BrandKitModalProps> = ({ isOpen, onClose, onSave, initialBrandKit }) => {
  const [primaryColor, setPrimaryColor] = useState('#0D47A1');
  const [secondaryColor, setSecondaryColor] = useState('#1976D2');
  const [font, setFont] = useState('Inter');
  const [logo, setLogo] = useState<BrandKit['logo'] | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialBrandKit) {
      setPrimaryColor(initialBrandKit.primaryColor);
      setSecondaryColor(initialBrandKit.secondaryColor);
      setFont(initialBrandKit.font);
      setLogo(initialBrandKit.logo);
      if (initialBrandKit.logo) {
        setLogoPreview(`data:${initialBrandKit.logo.mimeType};base64,${initialBrandKit.logo.base64}`);
      }
    }
  }, [initialBrandKit, isOpen]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setLogo({ base64, mimeType: file.type });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave({ primaryColor, secondaryColor, font, logo });
  };

  const InputLabel: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary mb-1">{children}</label>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Brand Kit"
      footerContent={
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Brand Kit</Button>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-text-secondary">Define your brand assets here. The AI will use these to generate on-brand LBL variations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel htmlFor="primaryColor">Primary Color</InputLabel>
            <div className="flex items-center gap-2">
              <input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 p-1 border-none rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
          <div>
            <InputLabel htmlFor="secondaryColor">Secondary Color</InputLabel>
            <div className="flex items-center gap-2">
              <input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-10 h-10 p-1 border-none rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
        </div>

        <div>
          <InputLabel htmlFor="font">Brand Font</InputLabel>
          <input
            id="font"
            type="text"
            placeholder="e.g., Helvetica, Lato"
            value={font}
            onChange={e => setFont(e.target.value)}
            className="w-full px-3 py-2 border border-base-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
          />
        </div>

        <div>
            <InputLabel htmlFor="logo">Brand Logo</InputLabel>
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-base-200 border border-base-300 rounded-md flex items-center justify-center">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <span className="text-xs text-text-secondary">No Logo</span>
                    )}
                </div>
                <input
                    id="logo"
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-light file:text-brand-blue hover:file:bg-opacity-80"
                />
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default BrandKitModal;