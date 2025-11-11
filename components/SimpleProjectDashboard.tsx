import React from 'react';

interface SimpleProjectDashboardProps {
  onNewProject: () => void;
}

export const SimpleProjectDashboard: React.FC<SimpleProjectDashboardProps> = ({ onNewProject }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Rx</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PharmaLBL Studio</h1>
                <p className="text-sm text-gray-500">Professional LBL Generation Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">Rx</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to PharmaLBL Studio</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered pharmaceutical Leave Behind Literature generation with precision component extraction and professional design standards.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🔬</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Component Extraction</h3>
            <p className="text-gray-600 text-sm">Advanced AI identifies and extracts pharmaceutical components with precision bounding boxes.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">🎨</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Design</h3>
            <p className="text-gray-600 text-sm">Generate pharmaceutical-grade LBLs that match your original design standards.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Generation</h3>
            <p className="text-gray-600 text-sm">Create multiple LBL variations in seconds with our advanced AI technology.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={onNewProject}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Start New Project →
          </button>
          <p className="text-gray-500 text-sm mt-4">Upload your LBL and begin component extraction</p>
        </div>
      </div>
    </div>
  );
};