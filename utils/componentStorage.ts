import type { ExtractedRegion, PharmaLabelData } from './advancedExtraction';

export interface StoredComponent extends ExtractedRegion {
  id: string;
  timestamp: number;
  usage_count: number;
  quality_rating: 'low' | 'medium' | 'high' | 'premium';
  tags: string[];
  project_id?: string;
  source_file?: string;
}

export interface ComponentLibrary {
  components: StoredComponent[];
  metadata: {
    total_components: number;
    last_updated: number;
    version: string;
  };
}

export class ComponentRepository {
  private storageKey = 'pharma_component_library';

  // Load library from localStorage
  private loadLibrary(): ComponentLibrary {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return {
        components: [],
        metadata: {
          total_components: 0,
          last_updated: Date.now(),
          version: '1.0.0'
        }
      };
    }
    return JSON.parse(stored);
  }

  // Save library to localStorage
  private saveLibrary(library: ComponentLibrary): void {
    library.metadata.last_updated = Date.now();
    library.metadata.total_components = library.components.length;
    localStorage.setItem(this.storageKey, JSON.stringify(library));
  }

  // Generate component ID
  private generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auto-rate component quality based on properties
  private rateQuality(region: ExtractedRegion): 'low' | 'medium' | 'high' | 'premium' {
    const { confidence, bbox, crop_base64 } = region;
    
    // Calculate area
    const area = bbox[2] * bbox[3];
    
    // Quality scoring
    let score = 0;
    if (confidence > 0.9) score += 3;
    else if (confidence > 0.7) score += 2;
    else if (confidence > 0.5) score += 1;
    
    if (area > 10000) score += 2; // Large components
    else if (area > 5000) score += 1;
    
    if (crop_base64.length > 50000) score += 1; // High resolution
    
    if (score >= 5) return 'premium';
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // Generate tags from component data
  private generateTags(region: ExtractedRegion): string[] {
    const tags: string[] = [region.component_type];
    
    if (region.raw_text) {
      // Add text-based tags
      const text = region.raw_text.toLowerCase();
      if (text.includes('mg') || text.includes('ml')) tags.push('dosage');
      if (text.includes('%')) tags.push('percentage');
      if (text.includes('trial') || text.includes('study')) tags.push('clinical');
      if (text.includes('fda') || text.includes('approved')) tags.push('regulatory');
    }
    
    // Add size-based tags
    const area = region.bbox[2] * region.bbox[3];
    if (area > 15000) tags.push('large');
    else if (area > 5000) tags.push('medium-size');
    else tags.push('small');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  // Store components from extraction
  storeFromExtraction(data: PharmaLabelData, projectId?: string, sourceFile?: string): StoredComponent[] {
    const library = this.loadLibrary();
    const newComponents: StoredComponent[] = [];
    
    // Combine all regions
    const allRegions = [
      ...data.logos,
      ...data.icons,
      ...data.badges,
      ...data.person_images,
      ...data.regulatory_blocks,
      ...data.layout_regions
    ];
    
    allRegions.forEach(region => {
      const storedComponent: StoredComponent = {
        ...region,
        id: this.generateId(),
        timestamp: Date.now(),
        usage_count: 0,
        quality_rating: this.rateQuality(region),
        tags: this.generateTags(region),
        project_id: projectId,
        source_file: sourceFile
      };
      
      library.components.push(storedComponent);
      newComponents.push(storedComponent);
    });
    
    this.saveLibrary(library);
    return newComponents;
  }

  // Search components
  searchComponents(filters: {
    type?: string;
    quality?: string;
    tags?: string[];
    project_id?: string;
    min_confidence?: number;
  }): StoredComponent[] {
    const library = this.loadLibrary();
    
    return library.components.filter(comp => {
      if (filters.type && comp.component_type !== filters.type) return false;
      if (filters.quality && comp.quality_rating !== filters.quality) return false;
      if (filters.project_id && comp.project_id !== filters.project_id) return false;
      if (filters.min_confidence && comp.confidence < filters.min_confidence) return false;
      if (filters.tags && !filters.tags.some(tag => comp.tags.includes(tag))) return false;
      
      return true;
    }).sort((a, b) => b.usage_count - a.usage_count); // Sort by popularity
  }

  // Get component by ID and increment usage
  useComponent(id: string): StoredComponent | null {
    const library = this.loadLibrary();
    const component = library.components.find(c => c.id === id);
    
    if (component) {
      component.usage_count++;
      this.saveLibrary(library);
    }
    
    return component || null;
  }

  // Get library statistics
  getStats(): {
    total: number;
    by_type: Record<string, number>;
    by_quality: Record<string, number>;
    most_used: StoredComponent[];
  } {
    const library = this.loadLibrary();
    
    const by_type: Record<string, number> = {};
    const by_quality: Record<string, number> = {};
    
    library.components.forEach(comp => {
      by_type[comp.component_type] = (by_type[comp.component_type] || 0) + 1;
      by_quality[comp.quality_rating] = (by_quality[comp.quality_rating] || 0) + 1;
    });
    
    const most_used = library.components
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10);
    
    return {
      total: library.components.length,
      by_type,
      by_quality,
      most_used
    };
  }

  // Export library
  exportLibrary(): string {
    const library = this.loadLibrary();
    return JSON.stringify(library, null, 2);
  }

  // Import library
  importLibrary(jsonData: string): boolean {
    try {
      const imported: ComponentLibrary = JSON.parse(jsonData);
      const existing = this.loadLibrary();
      
      // Merge components (avoid duplicates by checking crop_base64)
      const existingCrops = new Set(existing.components.map(c => c.crop_base64));
      const newComponents = imported.components.filter(c => !existingCrops.has(c.crop_base64));
      
      existing.components.push(...newComponents);
      this.saveLibrary(existing);
      
      return true;
    } catch (error) {
      console.error('Failed to import library:', error);
      return false;
    }
  }

  // Clear library
  clearLibrary(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const componentRepo = new ComponentRepository();