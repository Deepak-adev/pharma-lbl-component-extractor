import type { ImageComponent } from '../types';

export interface ExtractionResult {
  components: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[];
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    type: 'text' | 'image' | 'logo' | 'chart' | 'table' | 'icon' | 'background';
  }>;
}

export class AdvancedExtractionService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async extractComponents(base64: string, mimeType: string): Promise<ExtractionResult> {
    const img = await this.loadImage(base64);
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);

    // Multi-stage extraction
    const textRegions = await this.detectTextRegions();
    const imageRegions = await this.detectImageRegions();
    const logoRegions = await this.detectLogos();
    const chartRegions = await this.detectCharts();
    const tableRegions = await this.detectTables();
    const iconRegions = await this.detectIcons();

    // Combine and filter overlapping regions
    const allRegions = [
      ...textRegions,
      ...imageRegions,
      ...logoRegions,
      ...chartRegions,
      ...tableRegions,
      ...iconRegions
    ];

    const filteredRegions = this.filterOverlappingRegions(allRegions);
    const components = await this.regionsToComponents(filteredRegions, img);

    return {
      components,
      regions: filteredRegions
    };
  }

  private async loadImage(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `data:image/jpeg;base64,${base64}`;
    });
  }

  private async detectTextRegions(): Promise<Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'text'}>> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'text'}> = [];

    // Edge detection for text
    const edges = this.sobelEdgeDetection(imageData);
    const textCandidates = this.findTextLikeRegions(edges);

    for (const candidate of textCandidates) {
      if (this.isLikelyText(candidate, imageData)) {
        regions.push({
          ...candidate,
          confidence: this.calculateTextConfidence(candidate, imageData),
          type: 'text'
        });
      }
    }

    return regions;
  }

  private async detectImageRegions(): Promise<Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'image'}>> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'image'}> = [];

    // Detect continuous color regions that might be images
    const colorRegions = this.findColorRegions(imageData);
    
    for (const region of colorRegions) {
      if (this.isLikelyImage(region, imageData)) {
        regions.push({
          ...region,
          confidence: this.calculateImageConfidence(region, imageData),
          type: 'image'
        });
      }
    }

    return regions;
  }

  private async detectLogos(): Promise<Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'logo'}>> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'logo'}> = [];

    // Look for compact, high-contrast regions typically found in logos
    const contours = this.findContours(imageData);
    
    for (const contour of contours) {
      if (this.isLikelyLogo(contour, imageData)) {
        const bounds = this.getContourBounds(contour);
        regions.push({
          ...bounds,
          confidence: this.calculateLogoConfidence(bounds, imageData),
          type: 'logo'
        });
      }
    }

    return regions;
  }

  private async detectCharts(): Promise<Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'chart'}>> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'chart'}> = [];

    // Detect geometric patterns typical of charts
    const lines = this.detectLines(imageData);
    const chartCandidates = this.findChartPatterns(lines, imageData);

    for (const candidate of chartCandidates) {
      regions.push({
        ...candidate,
        confidence: this.calculateChartConfidence(candidate, imageData),
        type: 'chart'
      });
    }

    return regions;
  }

  private async detectTables(): Promise<Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'table'}>> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'table'}> = [];

    // Detect grid-like structures
    const horizontalLines = this.detectHorizontalLines(imageData);
    const verticalLines = this.detectVerticalLines(imageData);
    const tableCandidates = this.findTableStructures(horizontalLines, verticalLines);

    for (const candidate of tableCandidates) {
      regions.push({
        ...candidate,
        confidence: this.calculateTableConfidence(candidate, imageData),
        type: 'table'
      });
    }

    return regions;
  }

  private async detectIcons(): Promise<Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'icon'}>> {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: 'icon'}> = [];

    // Detect small, distinct graphical elements
    const smallRegions = this.findSmallDistinctRegions(imageData);
    
    for (const region of smallRegions) {
      if (this.isLikelyIcon(region, imageData)) {
        regions.push({
          ...region,
          confidence: this.calculateIconConfidence(region, imageData),
          type: 'icon'
        });
      }
    }

    return regions;
  }

  // Advanced image processing methods
  private sobelEdgeDetection(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            
            gx += gray * sobelX[kernelIdx];
            gy += gray * sobelY[kernelIdx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const outputIdx = (y * width + x) * 4;
        output.data[outputIdx] = magnitude;
        output.data[outputIdx + 1] = magnitude;
        output.data[outputIdx + 2] = magnitude;
        output.data[outputIdx + 3] = 255;
      }
    }
    
    return output;
  }

  private findTextLikeRegions(edges: ImageData): Array<{x: number, y: number, width: number, height: number}> {
    const regions: Array<{x: number, y: number, width: number, height: number}> = [];
    const { width, height, data } = edges;
    const visited = new Array(width * height).fill(false);

    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const idx = (y * width + x) * 4;
        if (!visited[y * width + x] && data[idx] > 50) {
          const region = this.floodFillRegion(edges, x, y, visited);
          if (region && this.isTextSizedRegion(region)) {
            regions.push(region);
          }
        }
      }
    }

    return regions;
  }

  private findColorRegions(imageData: ImageData): Array<{x: number, y: number, width: number, height: number}> {
    const regions: Array<{x: number, y: number, width: number, height: number}> = [];
    const { width, height, data } = imageData;
    const visited = new Array(width * height).fill(false);

    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        if (!visited[y * width + x]) {
          const region = this.floodFillColorRegion(imageData, x, y, visited);
          if (region && region.width > 50 && region.height > 50) {
            regions.push(region);
          }
        }
      }
    }

    return regions;
  }

  private findContours(imageData: ImageData): Array<Array<{x: number, y: number}>> {
    const edges = this.sobelEdgeDetection(imageData);
    const contours: Array<Array<{x: number, y: number}>> = [];
    const { width, height, data } = edges;
    const visited = new Array(width * height).fill(false);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (!visited[y * width + x] && data[idx] > 100) {
          const contour = this.traceContour(edges, x, y, visited);
          if (contour.length > 20) {
            contours.push(contour);
          }
        }
      }
    }

    return contours;
  }

  private detectLines(imageData: ImageData): Array<{x1: number, y1: number, x2: number, y2: number}> {
    const edges = this.sobelEdgeDetection(imageData);
    return this.houghLineTransform(edges);
  }

  private detectHorizontalLines(imageData: ImageData): Array<{x: number, y: number, width: number}> {
    const { width, height, data } = imageData;
    const lines: Array<{x: number, y: number, width: number}> = [];

    for (let y = 0; y < height; y++) {
      let lineStart = -1;
      let lineLength = 0;

      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        if (gray < 100) { // Dark pixel (potential line)
          if (lineStart === -1) lineStart = x;
          lineLength++;
        } else {
          if (lineLength > 50) { // Minimum line length
            lines.push({ x: lineStart, y, width: lineLength });
          }
          lineStart = -1;
          lineLength = 0;
        }
      }
      
      if (lineLength > 50) {
        lines.push({ x: lineStart, y, width: lineLength });
      }
    }

    return lines;
  }

  private detectVerticalLines(imageData: ImageData): Array<{x: number, y: number, height: number}> {
    const { width, height, data } = imageData;
    const lines: Array<{x: number, y: number, height: number}> = [];

    for (let x = 0; x < width; x++) {
      let lineStart = -1;
      let lineLength = 0;

      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        if (gray < 100) { // Dark pixel (potential line)
          if (lineStart === -1) lineStart = y;
          lineLength++;
        } else {
          if (lineLength > 50) { // Minimum line length
            lines.push({ x, y: lineStart, height: lineLength });
          }
          lineStart = -1;
          lineLength = 0;
        }
      }
      
      if (lineLength > 50) {
        lines.push({ x, y: lineStart, height: lineLength });
      }
    }

    return lines;
  }

  // Helper methods for region analysis
  private isLikelyText(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): boolean {
    const aspectRatio = region.width / region.height;
    const area = region.width * region.height;
    
    // Text typically has certain aspect ratios and sizes
    return aspectRatio > 1.5 && aspectRatio < 20 && area > 500 && area < 50000;
  }

  private isLikelyImage(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): boolean {
    const aspectRatio = region.width / region.height;
    const area = region.width * region.height;
    
    // Images are typically larger and more square
    return aspectRatio > 0.3 && aspectRatio < 3 && area > 5000;
  }

  private isLikelyLogo(contour: Array<{x: number, y: number}>, imageData: ImageData): boolean {
    const bounds = this.getContourBounds(contour);
    const area = bounds.width * bounds.height;
    const perimeter = contour.length;
    const compactness = (perimeter * perimeter) / area;
    
    // Logos are typically compact and medium-sized
    return area > 1000 && area < 20000 && compactness < 50;
  }

  private isLikelyIcon(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): boolean {
    const area = region.width * region.height;
    const aspectRatio = region.width / region.height;
    
    // Icons are small and roughly square
    return area > 100 && area < 5000 && aspectRatio > 0.5 && aspectRatio < 2;
  }

  private isTextSizedRegion(region: {x: number, y: number, width: number, height: number}): boolean {
    return region.width > 20 && region.height > 8 && region.width < 800 && region.height < 100;
  }

  // Confidence calculation methods
  private calculateTextConfidence(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): number {
    const aspectRatio = region.width / region.height;
    let confidence = 0.5;
    
    if (aspectRatio > 2 && aspectRatio < 15) confidence += 0.3;
    if (region.height > 10 && region.height < 50) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private calculateImageConfidence(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): number {
    const area = region.width * region.height;
    let confidence = 0.6;
    
    if (area > 10000) confidence += 0.2;
    if (this.hasVariedColors(region, imageData)) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private calculateLogoConfidence(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): number {
    let confidence = 0.7;
    
    if (this.hasHighContrast(region, imageData)) confidence += 0.2;
    if (region.y < imageData.height * 0.3) confidence += 0.1; // Logos often at top
    
    return Math.min(confidence, 1.0);
  }

  private calculateChartConfidence(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): number {
    return 0.8; // Simplified for now
  }

  private calculateTableConfidence(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): number {
    return 0.8; // Simplified for now
  }

  private calculateIconConfidence(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): number {
    return 0.7; // Simplified for now
  }

  // Utility methods
  private floodFillRegion(imageData: ImageData, startX: number, startY: number, visited: boolean[]): {x: number, y: number, width: number, height: number} | null {
    const { width, height, data } = imageData;
    const stack = [{x: startX, y: startY}];
    let minX = startX, minY = startY, maxX = startX, maxY = startY;
    let pixelCount = 0;

    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[y * width + x]) continue;
      
      const idx = (y * width + x) * 4;
      if (data[idx] < 50) continue; // Not an edge pixel
      
      visited[y * width + x] = true;
      pixelCount++;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
    }
    
    return pixelCount > 50 ? {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    } : null;
  }

  private floodFillColorRegion(imageData: ImageData, startX: number, startY: number, visited: boolean[]): {x: number, y: number, width: number, height: number} | null {
    const { width, height, data } = imageData;
    const startIdx = (startY * width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    
    const stack = [{x: startX, y: startY}];
    let minX = startX, minY = startY, maxX = startX, maxY = startY;
    let pixelCount = 0;

    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[y * width + x]) continue;
      
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Color similarity check
      const colorDiff = Math.abs(r - targetR) + Math.abs(g - targetG) + Math.abs(b - targetB);
      if (colorDiff > 100) continue;
      
      visited[y * width + x] = true;
      pixelCount++;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
    }
    
    return pixelCount > 200 ? {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    } : null;
  }

  private traceContour(edges: ImageData, startX: number, startY: number, visited: boolean[]): Array<{x: number, y: number}> {
    const contour: Array<{x: number, y: number}> = [];
    const { width, height, data } = edges;
    
    let x = startX, y = startY;
    let direction = 0; // 0=right, 1=down, 2=left, 3=up
    const directions = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];
    
    do {
      contour.push({x, y});
      visited[y * width + x] = true;
      
      // Find next edge pixel
      let found = false;
      for (let i = 0; i < 8; i++) {
        const dir = directions[(direction + i) % 4];
        const nx = x + dir.x;
        const ny = y + dir.y;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = (ny * width + nx) * 4;
          if (data[idx] > 100 && !visited[ny * width + nx]) {
            x = nx;
            y = ny;
            direction = (direction + i) % 4;
            found = true;
            break;
          }
        }
      }
      
      if (!found) break;
    } while (contour.length < 1000 && (x !== startX || y !== startY));
    
    return contour;
  }

  private getContourBounds(contour: Array<{x: number, y: number}>): {x: number, y: number, width: number, height: number} {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const point of contour) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private houghLineTransform(edges: ImageData): Array<{x1: number, y1: number, x2: number, y2: number}> {
    // Simplified Hough transform for line detection
    const lines: Array<{x1: number, y1: number, x2: number, y2: number}> = [];
    // Implementation would be complex, returning empty for now
    return lines;
  }

  private findChartPatterns(lines: Array<{x1: number, y1: number, x2: number, y2: number}>, imageData: ImageData): Array<{x: number, y: number, width: number, height: number}> {
    // Analyze line patterns to identify charts
    return [];
  }

  private findTableStructures(hLines: Array<{x: number, y: number, width: number}>, vLines: Array<{x: number, y: number, height: number}>): Array<{x: number, y: number, width: number, height: number}> {
    const tables: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // Find intersecting horizontal and vertical lines to form table grids
    for (const hLine of hLines) {
      for (const vLine of vLines) {
        // Check if lines intersect and form a grid pattern
        if (this.linesIntersect(hLine, vLine)) {
          // Find the bounding box of the table
          const tableRegion = this.findTableBounds(hLine, vLine, hLines, vLines);
          if (tableRegion) {
            tables.push(tableRegion);
          }
        }
      }
    }
    
    return tables;
  }

  private findSmallDistinctRegions(imageData: ImageData): Array<{x: number, y: number, width: number, height: number}> {
    const regions: Array<{x: number, y: number, width: number, height: number}> = [];
    const { width, height, data } = imageData;
    const visited = new Array(width * height).fill(false);

    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        if (!visited[y * width + x]) {
          const region = this.floodFillColorRegion(imageData, x, y, visited);
          if (region && region.width < 100 && region.height < 100 && region.width > 15 && region.height > 15) {
            regions.push(region);
          }
        }
      }
    }

    return regions;
  }

  private hasVariedColors(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): boolean {
    const { width, data } = imageData;
    const colors = new Set<string>();
    
    for (let y = region.y; y < region.y + region.height && y < imageData.height; y += 5) {
      for (let x = region.x; x < region.x + region.width && x < width; x += 5) {
        const idx = (y * width + x) * 4;
        const color = `${Math.floor(data[idx] / 50)},${Math.floor(data[idx + 1] / 50)},${Math.floor(data[idx + 2] / 50)}`;
        colors.add(color);
      }
    }
    
    return colors.size > 5;
  }

  private hasHighContrast(region: {x: number, y: number, width: number, height: number}, imageData: ImageData): boolean {
    const { width, data } = imageData;
    let minBrightness = 255, maxBrightness = 0;
    
    for (let y = region.y; y < region.y + region.height && y < imageData.height; y += 3) {
      for (let x = region.x; x < region.x + region.width && x < width; x += 3) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
      }
    }
    
    return (maxBrightness - minBrightness) > 100;
  }

  private linesIntersect(hLine: {x: number, y: number, width: number}, vLine: {x: number, y: number, height: number}): boolean {
    return (vLine.x >= hLine.x && vLine.x <= hLine.x + hLine.width) &&
           (hLine.y >= vLine.y && hLine.y <= vLine.y + vLine.height);
  }

  private findTableBounds(hLine: {x: number, y: number, width: number}, vLine: {x: number, y: number, height: number}, 
                         hLines: Array<{x: number, y: number, width: number}>, 
                         vLines: Array<{x: number, y: number, height: number}>): {x: number, y: number, width: number, height: number} | null {
    // Find the bounding box that encompasses the table structure
    let minX = Math.min(hLine.x, vLine.x);
    let minY = Math.min(hLine.y, vLine.y);
    let maxX = Math.max(hLine.x + hLine.width, vLine.x);
    let maxY = Math.max(hLine.y, vLine.y + vLine.height);
    
    // Expand to include nearby parallel lines
    for (const otherHLine of hLines) {
      if (Math.abs(otherHLine.y - hLine.y) < 50 && this.linesOverlap(hLine, otherHLine)) {
        minX = Math.min(minX, otherHLine.x);
        maxX = Math.max(maxX, otherHLine.x + otherHLine.width);
        maxY = Math.max(maxY, otherHLine.y);
      }
    }
    
    for (const otherVLine of vLines) {
      if (Math.abs(otherVLine.x - vLine.x) < 50 && this.verticalLinesOverlap(vLine, otherVLine)) {
        minY = Math.min(minY, otherVLine.y);
        maxY = Math.max(maxY, otherVLine.y + otherVLine.height);
        maxX = Math.max(maxX, otherVLine.x);
      }
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    return (width > 100 && height > 100) ? { x: minX, y: minY, width, height } : null;
  }

  private linesOverlap(line1: {x: number, width: number}, line2: {x: number, width: number}): boolean {
    return !(line1.x + line1.width < line2.x || line2.x + line2.width < line1.x);
  }

  private verticalLinesOverlap(line1: {y: number, height: number}, line2: {y: number, height: number}): boolean {
    return !(line1.y + line1.height < line2.y || line2.y + line2.height < line1.y);
  }

  private filterOverlappingRegions(regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: string}>): Array<{x: number, y: number, width: number, height: number, confidence: number, type: string}> {
    const filtered: Array<{x: number, y: number, width: number, height: number, confidence: number, type: string}> = [];
    
    // Sort by confidence (highest first)
    regions.sort((a, b) => b.confidence - a.confidence);
    
    for (const region of regions) {
      let overlaps = false;
      
      for (const existing of filtered) {
        if (this.regionsOverlap(region, existing)) {
          // Keep the one with higher confidence or larger area
          if (region.confidence > existing.confidence || 
              (region.width * region.height) > (existing.width * existing.height)) {
            // Remove the existing one and add this one
            const index = filtered.indexOf(existing);
            filtered.splice(index, 1);
            break;
          } else {
            overlaps = true;
            break;
          }
        }
      }
      
      if (!overlaps) {
        filtered.push(region);
      }
    }
    
    return filtered;
  }

  private regionsOverlap(region1: {x: number, y: number, width: number, height: number}, 
                        region2: {x: number, y: number, width: number, height: number}): boolean {
    const overlap = !(region1.x + region1.width < region2.x || 
                     region2.x + region2.width < region1.x || 
                     region1.y + region1.height < region2.y || 
                     region2.y + region2.height < region1.y);
    
    if (!overlap) return false;
    
    // Calculate overlap area
    const overlapX = Math.max(region1.x, region2.x);
    const overlapY = Math.max(region1.y, region2.y);
    const overlapWidth = Math.min(region1.x + region1.width, region2.x + region2.width) - overlapX;
    const overlapHeight = Math.min(region1.y + region1.height, region2.y + region2.height) - overlapY;
    const overlapArea = overlapWidth * overlapHeight;
    
    const area1 = region1.width * region1.height;
    const area2 = region2.width * region2.height;
    const minArea = Math.min(area1, area2);
    
    // Consider overlapping if more than 30% of the smaller region overlaps
    return (overlapArea / minArea) > 0.3;
  }

  private async regionsToComponents(regions: Array<{x: number, y: number, width: number, height: number, confidence: number, type: string}>, 
                                   img: HTMLImageElement): Promise<Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[]> {
    const components: Omit<ImageComponent, 'id' | 'base64' | 'mimeType'>[] = [];
    
    for (const region of regions) {
      const category = this.mapTypeToCategory(region.type);
      const name = this.generateComponentName(region.type, region);
      const description = this.generateComponentDescription(region.type, region);
      
      // Add padding to ensure complete content capture
      const padding = 10;
      const boundingBox = {
        x: Math.max(0, (region.x - padding) / img.width * 100),
        y: Math.max(0, (region.y - padding) / img.height * 100),
        width: Math.min(100, (region.width + 2 * padding) / img.width * 100),
        height: Math.min(100, (region.height + 2 * padding) / img.height * 100)
      };
      
      components.push({
        name,
        description,
        category,
        boundingBox
      });
    }
    
    return components;
  }

  private mapTypeToCategory(type: string): string {
    const mapping: Record<string, string> = {
      'text': 'Text Block',
      'image': 'Product Image (Packshot)',
      'logo': 'Brand Logo',
      'chart': 'Chart/Graph',
      'table': 'Data Table',
      'icon': 'Key Feature Icon'
    };
    
    return mapping[type] || 'Other Element';
  }

  private generateComponentName(type: string, region: {x: number, y: number, width: number, height: number}): string {
    const names: Record<string, string[]> = {
      'text': ['Headline Text', 'Body Text', 'Caption Text', 'Subheading', 'Product Description'],
      'image': ['Product Image', 'Hero Image', 'Supporting Visual', 'Product Shot'],
      'logo': ['Company Logo', 'Brand Mark', 'Product Logo'],
      'chart': ['Data Chart', 'Performance Graph', 'Statistics Chart', 'Comparison Chart'],
      'table': ['Data Table', 'Specifications Table', 'Comparison Table'],
      'icon': ['Feature Icon', 'Benefit Icon', 'Navigation Icon', 'Status Icon']
    };
    
    const typeNames = names[type] || ['Component'];
    const randomName = typeNames[Math.floor(Math.random() * typeNames.length)];
    
    return `${randomName} (${region.width}x${region.height})`;
  }

  private generateComponentDescription(type: string, region: {x: number, y: number, width: number, height: number}): string {
    const descriptions: Record<string, string> = {
      'text': 'Text content with pharmaceutical information and messaging',
      'image': 'Visual element showing product or supporting imagery',
      'logo': 'Brand identity element with company or product branding',
      'chart': 'Data visualization showing clinical or performance metrics',
      'table': 'Structured data presentation with pharmaceutical information',
      'icon': 'Small graphical element representing features or benefits'
    };
    
    return descriptions[type] || 'Pharmaceutical marketing component';
  }
}

export const advancedExtractionService = new AdvancedExtractionService();