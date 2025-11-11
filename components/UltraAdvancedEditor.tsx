import React, { useState, useRef, useEffect } from 'react';
import type { ImageComponent } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Icons } from './ui/Icons';
import { cropLearningService } from '../services/cropLearningService';

interface UltraAdvancedEditorProps {
  isOpen: boolean;
  onClose: () => void;
  component: ImageComponent;
  onSave: (component: ImageComponent) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
  invert: number;
}

export const UltraAdvancedEditor: React.FC<UltraAdvancedEditorProps> = ({
  isOpen,
  onClose,
  component,
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [componentImage, setComponentImage] = useState<HTMLImageElement | null>(null);
  const [useSourceImage, setUseSourceImage] = useState(true);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 });
  const [originalCropArea, setOriginalCropArea] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 });
  const [hasSmartSuggestion, setHasSmartSuggestion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'crop' | 'filter' | 'transform'>('crop');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(1);
  
  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0
  });

  useEffect(() => {
    if (isOpen && component.base64) {
      const compImg = new Image();
      compImg.onload = () => {
        setComponentImage(compImg);
        if (!useSourceImage || !(component as any).originalImage) {
          setImage(compImg);
          drawCanvas(compImg);
        }
      };
      compImg.src = `data:${component.mimeType};base64,${component.base64}`;
      
      if ((component as any).originalImage) {
        const origImg = new Image();
        origImg.onload = () => {
          setOriginalImage(origImg);
          if (useSourceImage) {
            setImage(origImg);
            drawCanvas(origImg);
          }
        };
        origImg.src = `data:image/jpeg;base64,${(component as any).originalImage}`;
      }
      
      setUseSourceImage((component as any).hasSourceImage && (component as any).originalImage ? true : false);
      
      // Apply smart crop suggestion if available
      const initialCrop = { x: 10, y: 10, width: 80, height: 80 };
      const smartSuggestion = cropLearningService.getSmartCropSuggestion(component.category, initialCrop);
      
      if (smartSuggestion) {
        setCropArea(smartSuggestion);
        setHasSmartSuggestion(true);
      } else {
        setCropArea(initialCrop);
        setHasSmartSuggestion(false);
      }
      
      setOriginalCropArea(initialCrop);
    }
  }, [isOpen, component.base64]);
  
  useEffect(() => {
    if (useSourceImage && originalImage) {
      setImage(originalImage);
      drawCanvas(originalImage);
    } else if (!useSourceImage && componentImage) {
      setImage(componentImage);
      drawCanvas(componentImage);
    }
  }, [useSourceImage, originalImage, componentImage]);

  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sourceImg = useSourceImage && originalImage ? originalImage : (componentImage || img);
    
    canvas.width = 600;
    canvas.height = 450;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const imgAspect = sourceImg.width / sourceImg.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (imgAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
      offsetX = (canvas.width - drawWidth) / 2;
    }
    
    if (mode !== 'crop') {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      
      const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%)`;
      ctx.filter = filterString;
      
      ctx.drawImage(sourceImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    } else {
      ctx.drawImage(sourceImg, offsetX, offsetY, drawWidth, drawHeight);
    }

    if (mode === 'crop') {
      const cropX = offsetX + (cropArea.x / 100) * drawWidth;
      const cropY = offsetY + (cropArea.y / 100) * drawHeight;
      const cropW = (cropArea.width / 100) * drawWidth;
      const cropH = (cropArea.height / 100) * drawHeight;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(cropX, cropY, cropW, cropH);
      
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.strokeRect(cropX, cropY, cropW, cropH);
      
      ctx.fillStyle = '#3B82F6';
      const handleSize = 10;
      ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW/2 - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW/2 - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX - handleSize/2, cropY + cropH/2 - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY + cropH/2 - handleSize/2, handleSize, handleSize);
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cropX + cropW/3, cropY);
      ctx.lineTo(cropX + cropW/3, cropY + cropH);
      ctx.moveTo(cropX + 2*cropW/3, cropY);
      ctx.lineTo(cropX + 2*cropW/3, cropY + cropH);
      ctx.moveTo(cropX, cropY + cropH/3);
      ctx.lineTo(cropX + cropW, cropY + cropH/3);
      ctx.moveTo(cropX, cropY + 2*cropH/3);
      ctx.lineTo(cropX + cropW, cropY + 2*cropH/3);
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (image) drawCanvas(image);
  }, [image, cropArea, mode, rotation, flipH, flipV, filters]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const getResizeHandle = (mouseX: number, mouseY: number) => {
    const { x, y, width, height } = cropArea;
    const tolerance = 5; // Larger tolerance for easier grabbing
    
    if (Math.abs(mouseX - x) < tolerance && Math.abs(mouseY - y) < tolerance) return 'nw';
    if (Math.abs(mouseX - (x + width)) < tolerance && Math.abs(mouseY - y) < tolerance) return 'ne';
    if (Math.abs(mouseX - x) < tolerance && Math.abs(mouseY - (y + height)) < tolerance) return 'sw';
    if (Math.abs(mouseX - (x + width)) < tolerance && Math.abs(mouseY - (y + height)) < tolerance) return 'se';
    if (Math.abs(mouseX - x) < tolerance && mouseY > y && mouseY < y + height) return 'w';
    if (Math.abs(mouseX - (x + width)) < tolerance && mouseY > y && mouseY < y + height) return 'e';
    if (Math.abs(mouseY - y) < tolerance && mouseX > x && mouseX < x + width) return 'n';
    if (Math.abs(mouseY - (y + height)) < tolerance && mouseX > x && mouseX < x + width) return 's';
    
    if (mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) return 'move';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'crop') return;
    
    const { x, y } = getMousePos(e);
    const handle = getResizeHandle(x, y);
    
    if (handle) {
      if (handle === 'move') {
        setIsDragging(true);
      } else {
        setIsResizing(handle);
      }
      setDragStart({ x, y });
    } else {
      setIsDragging(true);
      setDragStart({ x, y });
      setCropArea({ x, y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode !== 'crop') return;
    
    const { x, y } = getMousePos(e);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const handle = getResizeHandle(x, y);
      const cursors = {
        'nw': 'nw-resize', 'ne': 'ne-resize', 'sw': 'sw-resize', 'se': 'se-resize',
        'n': 'n-resize', 's': 's-resize', 'w': 'w-resize', 'e': 'e-resize',
        'move': 'move'
      };
      canvas.style.cursor = handle ? cursors[handle] : 'crosshair';
    }
    
    if (isDragging || isResizing) {
      if (isResizing) {
        const dx = (x - dragStart.x) * 0.5; // Reduce sensitivity
        const dy = (y - dragStart.y) * 0.5;
        let newArea = { ...cropArea };
        
        switch (isResizing) {
          case 'nw':
            newArea.x = Math.max(0, cropArea.x + dx);
            newArea.y = Math.max(0, cropArea.y + dy);
            newArea.width = Math.max(5, cropArea.width - dx);
            newArea.height = Math.max(5, cropArea.height - dy);
            break;
          case 'ne':
            newArea.y = Math.max(0, cropArea.y + dy);
            newArea.width = Math.max(5, cropArea.width + dx);
            newArea.height = Math.max(5, cropArea.height - dy);
            break;
          case 'sw':
            newArea.x = Math.max(0, cropArea.x + dx);
            newArea.width = Math.max(5, cropArea.width - dx);
            newArea.height = Math.max(5, cropArea.height + dy);
            break;
          case 'se':
            newArea.width = Math.max(5, cropArea.width + dx);
            newArea.height = Math.max(5, cropArea.height + dy);
            break;
          case 'n':
            newArea.y = Math.max(0, cropArea.y + dy);
            newArea.height = Math.max(5, cropArea.height - dy);
            break;
          case 's':
            newArea.height = Math.max(5, cropArea.height + dy);
            break;
          case 'w':
            newArea.x = Math.max(0, cropArea.x + dx);
            newArea.width = Math.max(5, cropArea.width - dx);
            break;
          case 'e':
            newArea.width = Math.max(5, cropArea.width + dx);
            break;
        }
        
        newArea.x = Math.max(0, Math.min(newArea.x, 100 - newArea.width));
        newArea.y = Math.max(0, Math.min(newArea.y, 100 - newArea.height));
        newArea.width = Math.min(newArea.width, 100 - newArea.x);
        newArea.height = Math.min(newArea.height, 100 - newArea.y);
        
        setCropArea(newArea);
        setDragStart({ x, y });
      } else if (isDragging) {
        if (cropArea.width > 5 && cropArea.height > 5) {
          const dx = (x - dragStart.x) * 0.3; // Slower movement
          const dy = (y - dragStart.y) * 0.3;
          setCropArea(prev => ({
            ...prev,
            x: Math.max(0, Math.min(prev.x + dx, 100 - prev.width)),
            y: Math.max(0, Math.min(prev.y + dy, 100 - prev.height))
          }));
          setDragStart({ x, y });
        } else {
          setCropArea({
            x: Math.min(dragStart.x, x),
            y: Math.min(dragStart.y, y),
            width: Math.abs(x - dragStart.x),
            height: Math.abs(y - dragStart.y)
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'vintage':
        setFilters({ ...filters, sepia: 50, contrast: 110, brightness: 90 });
        break;
      case 'bw':
        setFilters({ ...filters, grayscale: 100, contrast: 120 });
        break;
      case 'vivid':
        setFilters({ ...filters, saturation: 150, contrast: 120, brightness: 105 });
        break;
      case 'cool':
        setFilters({ ...filters, hue: 180, saturation: 120 });
        break;
      case 'warm':
        setFilters({ ...filters, hue: 30, brightness: 110 });
        break;
    }
  };

  const resetAll = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0
    });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
  };

  const handleSave = async () => {
    try {
      const sourceImg = useSourceImage && originalImage ? originalImage : (componentImage || image);
      if (!sourceImg) {
        alert('No image available to crop');
        return;
      }
      
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) {
        alert('Canvas not supported');
        return;
      }
      
      const cropX = Math.max(0, (cropArea.x / 100) * sourceImg.width);
      const cropY = Math.max(0, (cropArea.y / 100) * sourceImg.height);
      const cropW = Math.min((cropArea.width / 100) * sourceImg.width, sourceImg.width - cropX);
      const cropH = Math.min((cropArea.height / 100) * sourceImg.height, sourceImg.height - cropY);
      
      if (cropW <= 0 || cropH <= 0) {
        alert('Invalid crop area');
        return;
      }
      
      finalCanvas.width = cropW;
      finalCanvas.height = cropH;
      
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      
      // Apply filters
      if (mode === 'filter') {
        const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%)`;
        finalCtx.filter = filterString;
      }
      
      // Apply transforms
      if (mode === 'transform') {
        finalCtx.save();
        finalCtx.translate(cropW / 2, cropH / 2);
        finalCtx.rotate((rotation * Math.PI) / 180);
        finalCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        finalCtx.drawImage(sourceImg, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
        finalCtx.restore();
      } else {
        // Simple crop
        finalCtx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }
      
      const dataURL = finalCanvas.toDataURL('image/jpeg', 0.95);
      const base64 = dataURL.split(',')[1];

      if (!base64) {
        alert('Failed to generate image');
        return;
      }

      const updatedComponent: ImageComponent = {
        ...component,
        base64,
        mimeType: 'image/jpeg'
      };

      // Record crop learning data
      const finalCropArea = { x: cropArea.x, y: cropArea.y, width: cropArea.width, height: cropArea.height };
      if (JSON.stringify(finalCropArea) !== JSON.stringify(originalCropArea)) {
        cropLearningService.recordCropAdjustment(
          component.category,
          originalCropArea,
          finalCropArea
        );
      }
      
      console.log('Saving component:', updatedComponent.name);
      onSave(updatedComponent);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save component: ' + error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ultra Advanced Editor"
      size="large"
      footerContent={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={resetAll}>Reset All</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Ultra Enhanced</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4 flex gap-2">
            <Button
              size="small"
              variant={mode === 'crop' ? 'primary' : 'secondary'}
              onClick={() => setMode('crop')}
            >
              ✂️ Crop
            </Button>
            <Button
              size="small"
              variant={mode === 'filter' ? 'primary' : 'secondary'}
              onClick={() => setMode('filter')}
            >
              🎨 Filters
            </Button>
            <Button
              size="small"
              variant={mode === 'transform' ? 'primary' : 'secondary'}
              onClick={() => setMode('transform')}
            >
              🔄 Transform
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <canvas
              ref={canvasRef}
              className="max-w-full cursor-crosshair block"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {mode === 'crop' && (
            <div>
              <h3 className="font-semibold mb-3">Crop Controls</h3>
              {hasSmartSuggestion && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Icons.Sparkles className="w-4 h-4" />
                    <span>Smart crop applied based on your previous edits for {component.category}</span>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Crop Source</h4>
                <div className="space-y-2">
                  {originalImage && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cropSource"
                        checked={useSourceImage}
                        onChange={() => setUseSourceImage(true)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">📄 Source Document (Full Page)</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cropSource"
                      checked={!useSourceImage}
                      onChange={() => setUseSourceImage(false)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">🧩 Component Only (Extracted)</span>
                  </label>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {useSourceImage && originalImage 
                    ? 'Cropping from the original document where this component was found'
                    : 'Cropping from the extracted component image only'
                  }
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs">X: {Math.round(cropArea.x)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={cropArea.x}
                    onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs">Y: {Math.round(cropArea.y)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={cropArea.y}
                    onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs">Width: {Math.round(cropArea.width)}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={cropArea.width}
                    onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs">Height: {Math.round(cropArea.height)}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={cropArea.height}
                    onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 mt-3">
                  <Button size="small" variant="ghost" onClick={() => setCropArea({x: 0, y: 0, width: 50, height: 50})}>Top Left</Button>
                  <Button size="small" variant="ghost" onClick={() => setCropArea({x: 50, y: 0, width: 50, height: 50})}>Top Right</Button>
                  <Button size="small" variant="ghost" onClick={() => setCropArea({x: 25, y: 25, width: 50, height: 50})}>Center</Button>
                  <Button size="small" variant="ghost" onClick={() => setCropArea({x: 10, y: 10, width: 80, height: 80})}>Full</Button>
                </div>
              </div>
            </div>
          )}

          {mode === 'filter' && (
            <div>
              <h3 className="font-semibold mb-3">Filter Controls</h3>
              
              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block">Presets</label>
                <div className="grid grid-cols-2 gap-1">
                  {['vintage', 'bw', 'vivid', 'cool', 'warm'].map(preset => (
                    <Button
                      key={preset}
                      size="small"
                      variant="ghost"
                      onClick={() => applyPreset(preset)}
                      className="text-xs"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(filters).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs capitalize">{key}: {value}{key === 'hue' ? '°' : key === 'blur' ? 'px' : '%'}</label>
                    <input
                      type="range"
                      min={key === 'hue' ? -180 : key === 'blur' ? 0 : 0}
                      max={key === 'hue' ? 180 : key === 'blur' ? 10 : 200}
                      value={value}
                      onChange={(e) => setFilters(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'transform' && (
            <div>
              <h3 className="font-semibold mb-3">Transform Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs">Rotation: {rotation}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="small"
                    variant={flipH ? 'primary' : 'secondary'}
                    onClick={() => setFlipH(!flipH)}
                    className="flex-1"
                  >
                    Flip H
                  </Button>
                  <Button
                    size="small"
                    variant={flipV ? 'primary' : 'secondary'}
                    onClick={() => setFlipV(!flipV)}
                    className="flex-1"
                  >
                    Flip V
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <Button size="small" variant="ghost" onClick={() => setRotation(0)}>0°</Button>
                  <Button size="small" variant="ghost" onClick={() => setRotation(90)}>90°</Button>
                  <Button size="small" variant="ghost" onClick={() => setRotation(180)}>180°</Button>
                  <Button size="small" variant="ghost" onClick={() => setRotation(270)}>270°</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};