import { databaseService } from './databaseService';
import { storageService } from './storageService';

class RefreshService {
  async refreshAllData(): Promise<void> {
    try {
      // Clear IndexedDB
      await this.clearIndexedDB();
      
      // Clear localStorage
      this.clearLocalStorage();
      
      // Reinitialize database
      await databaseService.init();
      
      console.log('Database refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh database:', error);
      throw error;
    }
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase('PharmaLBLExtractor');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  private clearLocalStorage(): void {
    const keysToKeep = ['pharma_lbl_user']; // Keep auth data
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  async refreshComponents(): Promise<void> {
    await storageService.clearComponents();
  }

  async refreshProjects(): Promise<void> {
    const projects = await databaseService.getAllProjects();
    for (const project of projects) {
      await databaseService.deleteProject(project.id);
    }
  }
}

export const refreshService = new RefreshService();