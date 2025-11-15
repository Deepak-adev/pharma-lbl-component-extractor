import React from 'react';

interface ComponentExtractionStatusProps {
  totalFiles: number;
  processedFiles: number;
  extractedComponents: number;
  currentFile?: string;
  isComplete: boolean;
  componentStats?: any[];
}

const ComponentExtractionStatus: React.FC<ComponentExtractionStatusProps> = ({
  totalFiles,
  processedFiles,
  extractedComponents,
  currentFile,
  isComplete
}) => {
  const progress = totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">🚀 Enhanced AI + Computer Vision Extraction</h3>
        <div className="text-sm text-gray-600">
          {processedFiles}/{totalFiles} files processed
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>🤖 Advanced component detection in progress...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentFile && !isComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">🔍 Analyzing:</span> {currentFile}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{extractedComponents}</div>
          <div className="text-sm text-green-600">Components Found</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{processedFiles}</div>
          <div className="text-sm text-blue-600">Files Processed</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">
            {extractedComponents > 0 ? Math.round(extractedComponents / Math.max(processedFiles, 1)) : 0}
          </div>
          <div className="text-sm text-purple-600">Avg per File</div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-lg">✅</span>
            <div>
              <p className="font-semibold text-green-800">🎉 Enhanced Extraction Complete!</p>
              <p className="text-sm text-green-700">
                Successfully extracted {extractedComponents} high-quality components from {totalFiles} files using advanced AI and computer vision.
              </p>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentExtractionStatus;