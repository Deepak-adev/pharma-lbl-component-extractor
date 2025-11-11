import React, { useState, useRef } from 'react';
import type { LBLVariation } from '../types';
import { Modal } from './ui/Modal';
import Button from './ui/Button';

interface LBLEditorProps {
  isOpen: boolean;
  onClose: () => void;
  variation: LBLVariation;
  onSave: (updatedVariation: LBLVariation) => void;
}

export const LBLEditor: React.FC<LBLEditorProps> = ({
  isOpen,
  onClose,
  variation,
  onSave
}) => {
  const [title, setTitle] = useState(variation.title);
  const [description, setDescription] = useState(variation.description);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ff0000');

  const handleSave = () => {
    const updatedVariation = {
      ...variation,
      title,
      description
    };
    onSave(updatedVariation);
    onClose();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadEdited = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_edited.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit LBL">
      <div className="p-6 max-w-4xl">
        {/* LBL Info */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LBL Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* LBL Preview & Editor */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">LBL Preview & Annotation</h3>
          
          {/* Drawing Tools */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Brush Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">{brushSize}px</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Color:</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300"
              />
            </div>
            
            <Button onClick={clearCanvas} variant="outline" size="sm">
              Clear Annotations
            </Button>
            
            <Button onClick={downloadEdited} variant="outline" size="sm">
              📥 Download Edited
            </Button>
          </div>

          {/* Canvas Editor */}
          <div className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            {variation.reconstructedImage && (
              <img
                src={`data:image/png;base64,${variation.reconstructedImage}`}
                alt={variation.title}
                className="w-full max-w-2xl mx-auto block"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />
            )}
            
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
            />
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            💡 Draw annotations directly on the LBL to highlight areas for improvement or add notes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};