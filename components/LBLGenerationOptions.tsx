import React, { useState } from 'react';
import type { LBLGenerationOptions } from '../services/geminiService';
import Button from './ui/Button';
import { SettingsIcon, SparklesIcon } from './ui/Icons';

interface LBLGenerationOptionsProps {
  onGenerate: (pageCount: number, options: LBLGenerationOptions) => void;
  isLoading: boolean;
  disabled: boolean;
}

const LBLGenerationOptions: React.FC<LBLGenerationOptionsProps> = ({ onGenerate, isLoading, disabled }) => {
  const [pageCount, setPageCount] = useState(4);
  const [theme, setTheme] = useState<LBLGenerationOptions['theme']>('professional');
  const [colorScheme, setColorScheme] = useState<LBLGenerationOptions['colorScheme']>('blue');
  const [layout, setLayout] = useState<LBLGenerationOptions['layout']>('grid');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = () => {
    const options: LBLGenerationOptions = {
      theme,
      colorScheme,
      layout,
      customPrompt: customPrompt.trim() || undefined
    };
    onGenerate(pageCount, options);
  };

  const suggestions = [
    'Make it more visually appealing with modern gradients',
    'Focus on clinical data and scientific credibility',
    'Use warm colors and patient-friendly language',
    'Add premium gold accents for luxury feel',
    'Emphasize key benefits with bold typography',
    'Include more white space for clean look'
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          LBL Generation Settings
        </h3>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SettingsIcon className="w-4 h-4" />
          {showAdvanced ? 'Simple' : 'Advanced'}
        </Button>
      </div>

      {/* Page Count */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Page Count</label>
        <div className="flex gap-2">
          {[1, 2, 4, 6, 8].map(count => (
            <button
              key={count}
              onClick={() => setPageCount(count)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                pageCount === count
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {showAdvanced && (
        <>
          {/* Theme Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as LBLGenerationOptions['theme'])}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="professional">Professional - Corporate & Clean</option>
              <option value="modern">Modern - Contemporary & Bold</option>
              <option value="clinical">Clinical - Data-Driven & Scientific</option>
              <option value="patient-friendly">Patient-Friendly - Warm & Approachable</option>
              <option value="premium">Premium - Luxury & Sophisticated</option>
            </select>
          </div>

          {/* Color Scheme */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Color Scheme</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'blue', label: 'Trust Blue', color: 'bg-blue-600' },
                { value: 'green', label: 'Health Green', color: 'bg-green-600' },
                { value: 'red', label: 'Medical Red', color: 'bg-red-600' },
                { value: 'purple', label: 'Innovation Purple', color: 'bg-purple-600' },
                { value: 'custom', label: 'Brand Colors', color: 'bg-gradient-to-r from-blue-500 to-purple-500' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setColorScheme(value as LBLGenerationOptions['colorScheme'])}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorScheme === value
                      ? 'border-brand-blue ring-2 ring-brand-blue ring-opacity-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-full h-8 ${color} rounded mb-1`}></div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Style */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Layout Style</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'grid', label: 'Grid Layout', desc: 'Structured & organized' },
                { value: 'flowing', label: 'Flowing Layout', desc: 'Organic & natural' },
                { value: 'minimal', label: 'Minimal Layout', desc: 'Clean & spacious' },
                { value: 'detailed', label: 'Detailed Layout', desc: 'Information-rich' }
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setLayout(value as LBLGenerationOptions['layout'])}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    layout === value
                      ? 'bg-brand-blue-light border-brand-blue text-brand-blue'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific requirements, style preferences, or special instructions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
              rows={3}
            />
            
            {/* Suggestions */}
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomPrompt(suggestion)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-brand-blue-light hover:text-brand-blue transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={disabled || isLoading}
        size="large"
        className="w-full"
      >
        {isLoading ? (
          <>
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            Generating Perfect LBLs...
          </>
        ) : (
          <>
            <SparklesIcon className="w-4 h-4" />
            Generate 5 Premium Variations
          </>
        )}
      </Button>
    </div>
  );
};

export default LBLGenerationOptions;