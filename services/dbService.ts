import type { ImageComponent, BrandKit } from '../types';

// Simple IndexedDB wrapper for client-side storage
class DBService {
  private dbName = 'PharmaLBLDB';
  private version = 1;
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
        
        if (!db.objectStoreNames.contains('components')) {
          const componentStore = db.createObjectStore('components', { keyPath: 'id' });
          componentStore.createIndex('category', 'category', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('brandkits')) {
          db.createObjectStore('brandkits', { keyPath: 'id' });
        }
      };
    });
  }

  async saveComponent(component: ImageComponent): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['components'], 'readwrite');
      const store = transaction.objectStore('components');
      const request = store.put(component);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveComponents(components: ImageComponent[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['components'], 'readwrite');
    const store = transaction.objectStore('components');
    
    for (const component of components) {
      store.put(component);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getComponents(): Promise<ImageComponent[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['components'], 'readonly');
      const store = transaction.objectStore('components');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteComponent(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['components'], 'readwrite');
      const store = transaction.objectStore('components');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveBrandKit(brandKit: BrandKit): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['brandkits'], 'readwrite');
      const store = transaction.objectStore('brandkits');
      const request = store.put({ ...brandKit, id: 'default' });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getBrandKit(): Promise<BrandKit | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['brandkits'], 'readonly');
      const store = transaction.objectStore('brandkits');
      const request = store.get('default');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...brandKit } = result;
          resolve(brandKit);
        } else {
          resolve(null);
        }
      };
    });
  }

  async clearComponents(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['components'], 'readwrite');
      const store = transaction.objectStore('components');
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const dbService = new DBService();