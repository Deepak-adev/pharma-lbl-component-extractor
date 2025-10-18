import React from 'react';
import Button from './Button';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footerContent }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-base-100 rounded-xl shadow-lg w-full max-w-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-brand-blue">{title}</h2>
          <Button variant="ghost" size="small" onClick={onClose} aria-label="Close modal">
            <CloseIcon className="w-5 h-5" />
          </Button>
        </header>
        <main className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </main>
        {footerContent && (
            <footer className="flex justify-end p-6 border-t border-base-300 bg-base-200/50 rounded-b-xl">
                {footerContent}
            </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;