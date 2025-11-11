import type { ImageComponent, LBLVariation, BrandKit } from '../types';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  originalImages: Array<{
    id: string;
    name: string;
    base64: string;
    mimeType: string;
  }>;
  extractedComponents: ImageComponent[];
  generatedVariations: LBLVariation[];
  brandKit?: BrandKit;
  extractedColors?: {
    primary: string;
    secondary: string;
    accent: string;
    dominant: string[];
  };
  tags: string[];
  status: 'draft' | 'processing' | 'completed' | 'archived';
}

export interface DatabaseStats {
  totalProjects: number;
  totalComponents: number;
  totalVariations: number;
  storageUsed: number;
}

class DatabaseService {
  private dbName = 'PharmaLBLExtractor';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        // Components store
        if (!db.objectStoreNames.contains('components')) {
          const componentStore = db.createObjectStore('components', { keyPath: 'id' });
          componentStore.createIndex('category', 'category', { unique: false });
          componentStore.createIndex('projectId', 'projectId', { unique: false });
        }
        
        // Variations store
        if (!db.objectStoreNames.contains('variations')) {
          const variationStore = db.createObjectStore('variations', { keyPath: 'id' });
          variationStore.createIndex('projectId', 'projectId', { unique: false });
          variationStore.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  async saveProject(project: ProjectData): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    project.updatedAt = new Date();
    await store.put(project);
  }

  async getProject(id: string): Promise<ProjectData | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProjects(): Promise<ProjectData[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    await store.delete(id);
  }

  async searchProjects(query: string): Promise<ProjectData[]> {
    const projects = await this.getAllProjects();
    const lowercaseQuery = query.toLowerCase();
    
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getStats(): Promise<DatabaseStats> {
    const projects = await this.getAllProjects();
    
    const totalComponents = projects.reduce((sum, p) => sum + p.extractedComponents.length, 0);
    const totalVariations = projects.reduce((sum, p) => sum + p.generatedVariations.length, 0);
    
    // Estimate storage (rough calculation)
    const storageUsed = projects.reduce((sum, p) => {
      const imageSize = p.originalImages.reduce((imgSum, img) => imgSum + img.base64.length, 0);
      const componentSize = p.extractedComponents.reduce((compSum, comp) => compSum + comp.base64.length, 0);
      return sum + imageSize + componentSize;
    }, 0);
    
    return {
      totalProjects: projects.length,
      totalComponents,
      totalVariations,
      storageUsed: Math.round(storageUsed * 0.75 / 1024 / 1024) // Convert to MB
    };
  }
}

export const databaseService = new DatabaseService();