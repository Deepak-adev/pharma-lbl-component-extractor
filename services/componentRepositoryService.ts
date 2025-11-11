import type { ImageComponent, ComponentCategory } from '../types';

export interface SavedComponent extends ImageComponent {
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  tags: string[];
  usage: number;
  quality: 'low' | 'medium' | 'high' | 'premium';
}

export interface ComponentFilter {
  category?: ComponentCategory;
  tags?: string[];
  quality?: SavedComponent['quality'];
  projectId?: string;
  searchTerm?: string;
}

class ComponentRepositoryService {
  private readonly STORAGE_KEY = 'pharma_component_repository';
  private components: SavedComponent[] = [];

  constructor() {
    this.loadComponents();
  }

  private loadComponents(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.components = parsed.map((comp: any) => ({
          ...comp,
          createdAt: new Date(comp.createdAt),
          updatedAt: new Date(comp.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load components from storage:', error);
      this.components = [];
    }\n  }\n\n  private saveComponents(): void {\n    try {\n      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.components));\n    } catch (error) {\n      console.error('Failed to save components to storage:', error);\n    }\n  }\n\n  async saveComponent(\n    component: ImageComponent,\n    options: {\n      projectId?: string;\n      tags?: string[];\n      quality?: SavedComponent['quality'];\n    } = {}\n  ): Promise<SavedComponent> {\n    const savedComponent: SavedComponent = {\n      ...component,\n      createdAt: new Date(),\n      updatedAt: new Date(),\n      projectId: options.projectId,\n      tags: options.tags || [],\n      usage: 0,\n      quality: options.quality || 'medium'\n    };\n\n    // Check if component already exists (by name and category)\n    const existingIndex = this.components.findIndex(\n      c => c.name === component.name && c.category === component.category\n    );\n\n    if (existingIndex >= 0) {\n      // Update existing component\n      this.components[existingIndex] = {\n        ...this.components[existingIndex],\n        ...savedComponent,\n        createdAt: this.components[existingIndex].createdAt, // Keep original creation date\n        usage: this.components[existingIndex].usage // Keep usage count\n      };\n    } else {\n      // Add new component\n      this.components.push(savedComponent);\n    }\n\n    this.saveComponents();\n    return savedComponent;\n  }\n\n  async getComponents(filter?: ComponentFilter): Promise<SavedComponent[]> {\n    let filtered = [...this.components];\n\n    if (filter) {\n      if (filter.category) {\n        filtered = filtered.filter(c => c.category === filter.category);\n      }\n\n      if (filter.tags && filter.tags.length > 0) {\n        filtered = filtered.filter(c => \n          filter.tags!.some(tag => c.tags.includes(tag))\n        );\n      }\n\n      if (filter.quality) {\n        filtered = filtered.filter(c => c.quality === filter.quality);\n      }\n\n      if (filter.projectId) {\n        filtered = filtered.filter(c => c.projectId === filter.projectId);\n      }\n\n      if (filter.searchTerm) {\n        const term = filter.searchTerm.toLowerCase();\n        filtered = filtered.filter(c => \n          c.name.toLowerCase().includes(term) ||\n          c.description.toLowerCase().includes(term) ||\n          c.tags.some(tag => tag.toLowerCase().includes(term))\n        );\n      }\n    }\n\n    // Sort by usage and creation date\n    return filtered.sort((a, b) => {\n      if (a.usage !== b.usage) {\n        return b.usage - a.usage; // Higher usage first\n      }\n      return b.createdAt.getTime() - a.createdAt.getTime(); // Newer first\n    });\n  }\n\n  async getComponentById(id: string): Promise<SavedComponent | null> {\n    return this.components.find(c => c.id === id) || null;\n  }\n\n  async updateComponent(id: string, updates: Partial<SavedComponent>): Promise<SavedComponent | null> {\n    const index = this.components.findIndex(c => c.id === id);\n    if (index === -1) return null;\n\n    this.components[index] = {\n      ...this.components[index],\n      ...updates,\n      updatedAt: new Date()\n    };\n\n    this.saveComponents();\n    return this.components[index];\n  }\n\n  async deleteComponent(id: string): Promise<boolean> {\n    const index = this.components.findIndex(c => c.id === id);\n    if (index === -1) return false;\n\n    this.components.splice(index, 1);\n    this.saveComponents();\n    return true;\n  }\n\n  async incrementUsage(id: string): Promise<void> {\n    const component = this.components.find(c => c.id === id);\n    if (component) {\n      component.usage++;\n      component.updatedAt = new Date();\n      this.saveComponents();\n    }\n  }\n\n  async getPopularComponents(limit: number = 10): Promise<SavedComponent[]> {\n    return this.components\n      .sort((a, b) => b.usage - a.usage)\n      .slice(0, limit);\n  }\n\n  async getRecentComponents(limit: number = 10): Promise<SavedComponent[]> {\n    return this.components\n      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())\n      .slice(0, limit);\n  }\n\n  async getComponentsByCategory(): Promise<Record<ComponentCategory, SavedComponent[]>> {\n    const result = {} as Record<ComponentCategory, SavedComponent[]>;\n    \n    this.components.forEach(component => {\n      if (!result[component.category]) {\n        result[component.category] = [];\n      }\n      result[component.category].push(component);\n    });\n\n    return result;\n  }\n\n  async exportComponents(): Promise<string> {\n    return JSON.stringify(this.components, null, 2);\n  }\n\n  async importComponents(jsonData: string): Promise<number> {\n    try {\n      const imported = JSON.parse(jsonData) as SavedComponent[];\n      let addedCount = 0;\n\n      for (const component of imported) {\n        const exists = this.components.some(c => c.id === component.id);\n        if (!exists) {\n          this.components.push({\n            ...component,\n            createdAt: new Date(component.createdAt),\n            updatedAt: new Date(component.updatedAt)\n          });\n          addedCount++;\n        }\n      }\n\n      this.saveComponents();\n      return addedCount;\n    } catch (error) {\n      throw new Error('Invalid component data format');\n    }\n  }\n\n  async getStats(): Promise<{\n    totalComponents: number;\n    componentsByCategory: Record<ComponentCategory, number>;\n    componentsByQuality: Record<SavedComponent['quality'], number>;\n    totalUsage: number;\n    averageUsage: number;\n  }> {\n    const componentsByCategory = {} as Record<ComponentCategory, number>;\n    const componentsByQuality = {} as Record<SavedComponent['quality'], number>;\n    let totalUsage = 0;\n\n    this.components.forEach(component => {\n      // Count by category\n      componentsByCategory[component.category] = \n        (componentsByCategory[component.category] || 0) + 1;\n      \n      // Count by quality\n      componentsByQuality[component.quality] = \n        (componentsByQuality[component.quality] || 0) + 1;\n      \n      totalUsage += component.usage;\n    });\n\n    return {\n      totalComponents: this.components.length,\n      componentsByCategory,\n      componentsByQuality,\n      totalUsage,\n      averageUsage: this.components.length > 0 ? totalUsage / this.components.length : 0\n    };\n  }\n\n  async searchSimilarComponents(component: ImageComponent): Promise<SavedComponent[]> {\n    // Simple similarity based on category and name keywords\n    const keywords = component.name.toLowerCase().split(' ');\n    \n    return this.components\n      .filter(c => \n        c.category === component.category ||\n        keywords.some(keyword => \n          c.name.toLowerCase().includes(keyword) ||\n          c.description.toLowerCase().includes(keyword)\n        )\n      )\n      .sort((a, b) => b.usage - a.usage)\n      .slice(0, 5);\n  }\n}\n\nexport const componentRepositoryService = new ComponentRepositoryService();