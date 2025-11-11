import React from 'react';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './ui/Icons';

export interface UploadProgressItem {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  componentsExtracted?: number;
}

interface UploadProgressProps {
  items: UploadProgressItem[];
  overallProgress: number;
  currentMessage: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ items, overallProgress, currentMessage }) => {
  const getStatusIcon = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <SparklesIcon className="w-5 h-5 text-brand-blue animate-pulse" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-base-300" />;
    }
  };

  const getStatusColor = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
        return 'text-brand-blue';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-base-100 p-8 rounded-xl shadow-medium max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-blue">Processing Files</h2>
        <p className="text-text-secondary mt-2">{currentMessage}</p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-primary">Overall Progress</span>
          <span className="text-sm text-text-secondary">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-3">
          <div 
            className="bg-brand-blue h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Individual File Progress */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-base-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <span className="font-medium text-text-primary truncate max-w-xs">
                  {item.fileName}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                  {item.status === 'completed' && item.componentsExtracted 
                    ? `${item.componentsExtracted} components`
                    : item.status.charAt(0).toUpperCase() + item.status.slice(1)
                  }
                </span>
              </div>
            </div>
            
            {item.status === 'processing' && (
              <div className="w-full bg-base-300 rounded-full h-2 mb-2">
                <div 
                  className="bg-brand-secondary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
            
            {item.message && (
              <p className="text-xs text-text-secondary mt-1">{item.message}</p>
            )}
          </div>
        ))}
      </div>

      {/* Processing Animation */}
      <div className="mt-8 text-center">
        <div className="flex justify-center items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-brand-accent animate-pulse" />
          <span className="text-sm text-text-secondary">
            AI is analyzing your files and extracting components...
          </span>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;