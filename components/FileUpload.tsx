import React, { useState, useMemo } from 'react';
import { UploadIconSimple, FileIcon, CheckCircleIcon, XCircleIcon } from './ui/Icons';
import Button from './ui/Button';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  onProcess: () => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, files, onProcess, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileCount = files.length;
  const isReady = fileCount >= 5 && fileCount <= 10;
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles && droppedFiles.length > 0) {
      onFilesChange(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange(Array.from(e.target.files));
    }
  };

  const Requirement = ({met, text}: {met: boolean; text: string}) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-text-secondary'}`}>
        {met ? <CheckCircleIcon className="w-4 h-4 mr-2" /> : <XCircleIcon className="w-4 h-4 mr-2" />}
        {text}
    </div>
  )

  return (
    <div className="bg-base-100 p-8 rounded-xl shadow-medium max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand-blue">Upload LBL Files</h2>
        <p className="text-text-secondary mt-2">Start by uploading your existing LBL files. The AI will deconstruct them into reusable components.</p>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 flex flex-col justify-center items-center h-full ${isDragging ? 'border-brand-blue bg-brand-blue-light' : 'border-base-300 bg-base-200'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <UploadIconSimple />
            <p className="mt-4 text-lg font-semibold text-text-primary">Drag & drop files here</p>
            <p className="text-text-secondary">or</p>
            <label htmlFor="file-upload" className="cursor-pointer mt-2 inline-block bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
            Browse Files
            </label>
            <input id="file-upload" type="file" multiple accept=".pdf,.jpeg,.jpg,.png" className="hidden" onChange={handleFileSelect} />
        </div>
        
        <div className="bg-base-200 p-6 rounded-lg">
            <h3 className="font-semibold text-text-primary mb-4">Requirements</h3>
            <div className="space-y-3">
                <Requirement met={isReady} text="Upload between 5 and 10 files" />
                <Requirement met={true} text="Accepted formats: PDF, JPG, PNG" />
            </div>

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-text-primary mb-2">{files.length} Files Selected</h3>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {files.map((file, index) => (
                        <div key={index} className="flex items-center bg-base-100 p-2 rounded-md">
                            <FileIcon className="w-6 h-6 text-brand-secondary mr-3 shrink-0" />
                            <div className="flex-grow truncate">
                                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                                <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>


      <div className="mt-8 border-t border-base-300 pt-6 flex justify-end">
        <Button 
          onClick={onProcess}
          disabled={disabled || !isReady}
          size="large"
        >
          Process {fileCount > 0 ? `${fileCount} ` : ''}Files
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;