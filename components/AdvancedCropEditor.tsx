import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ImageComponent } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Icons } from './ui/Icons';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AdvancedCropEditorProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string;
  component: ImageComponent;
  onSave: (croppedComponent: ImageComponent) => void;
}

export const AdvancedCropEditor: React.FC<AdvancedCropEditorProps> = ({
  isOpen,
  onClose,
  originalImage,
  component,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [cropMode, setCropMode] = useState<'drag' | 'precise'>('drag');
  const [enhanceOptions, setEnhanceOptions] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0
  });

  // Load and display the original image
  useEffect(() => {
    if (!isOpen || !originalImage) return;

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      setImageLoaded(true);
      drawCanvas(img);
    };
    img.onerror = () => {
      console.error('Failed to load image');
    };
    img.src = `data:image/jpeg;base64,${originalImage}`;
  }, [isOpen, originalImage]);

  const drawCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const containerWidth = 500;
    const containerHeight = 350;
    const aspectRatio = img.width / img.height;

    let canvasWidth, canvasHeight;
    if (aspectRatio > containerWidth / containerHeight) {
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / aspectRatio;
    } else {
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * aspectRatio;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Clear and draw image
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    // Draw crop overlay
    drawCropOverlay(ctx, canvasWidth, canvasHeight);
  }, [cropArea]);

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const cropX = (cropArea.x / 100) * canvasWidth;
    const cropY = (cropArea.y / 100) * canvasHeight;
    const cropW = (cropArea.width / 100) * canvasWidth;
    const cropH = (cropArea.height / 100) * canvasHeight;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Clear crop area
    ctx.clearRect(cropX, cropY, cropW, cropH);

    // Redraw image in crop area only
    if (imageElement) {
      ctx.drawImage(imageElement, 0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.clearRect(cropX, cropY, cropW, cropH);
      ctx.drawImage(
        imageElement,
        cropX, cropY, cropW, cropH,
        cropX, cropY, cropW, cropH
      );
    }

    // Crop border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Resize handles
    const handleSize = 8;
    ctx.fillStyle = '#3B82F6';
    const handles = [
      { x: cropX - handleSize/2, y: cropY - handleSize/2 }, // top-left
      { x: cropX + cropW - handleSize/2, y: cropY - handleSize/2 }, // top-right
      { x: cropX - handleSize/2, y: cropY + cropH - handleSize/2 }, // bottom-left
      { x: cropX + cropW - handleSize/2, y: cropY + cropH - handleSize/2 }, // bottom-right
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;

    const newWidth = Math.abs(x - dragStart.x);
    const newHeight = Math.abs(y - dragStart.y);
    const newX = Math.min(x, dragStart.x);
    const newY = Math.min(y, dragStart.y);

    setCropArea({
      x: Math.max(0, Math.min(newX, 100 - newWidth)),
      y: Math.max(0, Math.min(newY, 100 - newHeight)),
      width: Math.min(newWidth, 100 - newX),
      height: Math.min(newHeight, 100 - newY)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Update canvas when crop area changes
  useEffect(() => {
    if (imageElement && imageLoaded) {
      drawCanvas(imageElement);
      updatePreview();
    }
  }, [cropArea, imageElement, imageLoaded, drawCanvas]);

  const updatePreview = async () => {
    if (!imageElement || !imageLoaded) return;

    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    try {
      // Calculate crop dimensions
      const cropX = Math.max(0, (cropArea.x / 100) * imageElement.width);
      const cropY = Math.max(0, (cropArea.y / 100) * imageElement.height);
      const cropW = Math.min((cropArea.width / 100) * imageElement.width, imageElement.width - cropX);
      const cropH = Math.min((cropArea.height / 100) * imageElement.height, imageElement.height - cropY);

      if (cropW <= 0 || cropH <= 0) return;

      previewCanvas.width = cropW;
      previewCanvas.height = cropH;

      // Apply enhancements
      ctx.filter = `brightness(${enhanceOptions.brightness}%) contrast(${enhanceOptions.contrast}%) saturate(${enhanceOptions.saturation}%)`;
      
      ctx.drawImage(
        imageElement,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );

      // Apply sharpening if needed
      if (enhanceOptions.sharpness > 0) {
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const sharpened = applySharpen(imageData, enhanceOptions.sharpness / 100);
        ctx.putImageData(sharpened, 0, 0);
      }
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  };

  const applySharpen = (imageData: ImageData, amount: number): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(width, height);

    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * width + x) * 4 + c;
          result.data[idx] = Math.max(0, Math.min(255, sum));
        }
        result.data[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]; // Alpha
      }
    }

    return result;
  };

  const handleSave = async () => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    try {
      const croppedBase64 = previewCanvas.toDataURL('image/jpeg', 0.9);
      const base64Data = croppedBase64.split(',')[1];

      const updatedComponent: ImageComponent = {
        ...component,
        base64: base64Data,
        name: `${component.name} (Enhanced)`,
        id: `enhanced-${Date.now()}`
      };

      onSave(updatedComponent);
      onClose();
    } catch (error) {
      console.error('Failed to save cropped component:', error);
    }
  };

  const resetCrop = () => {
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
  };

  const presetCrops = [
    { name: 'Square', ratio: 1 },
    { name: 'Landscape', ratio: 16/9 },
    { name: 'Portrait', ratio: 9/16 },
    { name: 'Banner', ratio: 3/1 }
  ];

  const applyCropPreset = (ratio: number) => {
    const centerX = 50;
    const centerY = 50;
    let width, height;

    if (ratio >= 1) {
      height = 60;
      width = height * ratio;
    } else {
      width = 60;
      height = width / ratio;
    }

    setCropArea({
      x: Math.max(0, centerX - width/2),
      y: Math.max(0, centerY - height/2),
      width: Math.min(width, 100),
      height: Math.min(height, 100)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Crop Editor"
      size="large"
      footerContent={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={resetCrop}>Reset</Button>
          <Button onClick={handleSave}>Save Enhanced Component</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <Button
                size="small"
                variant={cropMode === 'drag' ? 'primary' : 'secondary'}
                onClick={() => setCropMode('drag')}
              >
                <Icons.Move className="w-4 h-4" />
                Drag Mode
              </Button>
              <Button
                size="small"
                variant={cropMode === 'precise' ? 'primary' : 'secondary'}
                onClick={() => setCropMode('precise')}
              >
                <Icons.Settings className="w-4 h-4" />
                Precise Mode
              </Button>
            </div>
            <div className="flex gap-1">
              {presetCrops.map(preset => (
                <Button
                  key={preset.name}
                  size="small"
                  variant="ghost"
                  onClick={() => applyCropPreset(preset.ratio)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <canvas
              ref={canvasRef}
              className="max-w-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {cropMode === 'precise' && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">X (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(cropArea.x)}
                  onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Y (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(cropArea.y)}
                  onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Width (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={Math.round(cropArea.width)}
                  onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Height (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={Math.round(cropArea.height)}
                  onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls and Preview */}
        <div className="space-y-4">
          {/* Preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
            <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-48 mx-auto block"
              />
            </div>
          </div>

          {/* Enhancement Controls */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Enhancement</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Brightness: {enhanceOptions.brightness}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={enhanceOptions.brightness}
                  onChange={(e) => setEnhanceOptions(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Contrast: {enhanceOptions.contrast}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={enhanceOptions.contrast}
                  onChange={(e) => setEnhanceOptions(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Saturation: {enhanceOptions.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={enhanceOptions.saturation}
                  onChange={(e) => setEnhanceOptions(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sharpness: {enhanceOptions.sharpness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={enhanceOptions.sharpness}
                  onChange={(e) => setEnhanceOptions(prev => ({ ...prev, sharpness: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <Button
                size="small"
                variant="ghost"
                onClick={() => setEnhanceOptions({ brightness: 100, contrast: 100, saturation: 100, sharpness: 0 })}
                className="w-full"
              >
                Reset Enhancements
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};