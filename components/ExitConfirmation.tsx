import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';

interface ExitConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  projectName?: string;
}

export const ExitConfirmation: React.FC<ExitConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSave,
  hasUnsavedChanges,
  projectName
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exit Project">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Icons.AlertCircle className="w-8 h-8 text-amber-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {hasUnsavedChanges ? 'Save Changes?' : 'Exit Project?'}
            </h3>
            <p className="text-sm text-gray-600">
              {projectName && `Project: ${projectName}`}
            </p>
          </div>
        </div>
        
        {hasUnsavedChanges ? (
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              You have unsaved changes. What would you like to do?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <Icons.AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-2" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Unsaved changes include:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Extracted components</li>
                    <li>Generated LBL variations</li>
                    <li>Brand kit settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-6">
            Are you sure you want to exit this project and return to the dashboard?
          </p>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Icons.X className="w-4 h-4" />
            Cancel
          </Button>
          
          {hasUnsavedChanges && (
            <Button
              onClick={onSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Icons.Check className="w-4 h-4" />
              Save & Exit
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onConfirm}
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            {hasUnsavedChanges ? 'Exit Without Saving' : 'Exit Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};