import type { ImageComponent, BrandKit } from '../types';
import { mongoService } from './mongoService';
import { dbService } from './dbService';

export const storageService = {
  saveComponents: async (components: ImageComponent[]): Promise<void> => {
    try {
      await mongoService.saveComponents(components);
    } catch (error) {
      console.warn('MongoDB failed, using IndexedDB:', error);
      await dbService.saveComponents(components);
    }
  },

  loadComponents: async (): Promise<ImageComponent[]> => {
    try {
      const mongoComponents = await mongoService.getComponents();
      if (mongoComponents.length > 0) return mongoComponents;
    } catch (error) {
      console.warn('MongoDB fetch failed, using IndexedDB:', error);
    }
    return await dbService.getComponents();
  },

  addComponents: async (newComponents: ImageComponent[]): Promise<ImageComponent[]> => {
    try {
      await mongoService.saveComponents(newComponents);
      return await mongoService.getComponents();
    } catch (error) {
      const existing = await dbService.getComponents();
      const updated = [...existing, ...newComponents];
      await dbService.saveComponents(updated);
      return updated;
    }
  },

  updateComponent: async (updatedComponent: ImageComponent): Promise<ImageComponent[]> => {
    try {
      await mongoService.saveComponent(updatedComponent);
      return await mongoService.getComponents();
    } catch (error) {
      await dbService.saveComponent(updatedComponent);
      return await dbService.getComponents();
    }
  },

  deleteComponent: async (componentId: string): Promise<ImageComponent[]> => {
    try {
      await mongoService.deleteComponent(componentId);
      return await mongoService.getComponents();
    } catch (error) {
      await dbService.deleteComponent(componentId);
      return await dbService.getComponents();
    }
  },

  saveBrandKit: async (brandKit: BrandKit): Promise<void> => {
    try {
      await mongoService.saveBrandKit(brandKit);
    } catch (error) {
      await dbService.saveBrandKit(brandKit);
    }
  },

  loadBrandKit: async (): Promise<BrandKit | null> => {
    try {
      const mongoBrandKit = await mongoService.getBrandKit();
      if (mongoBrandKit) return mongoBrandKit;
    } catch (error) {
      console.warn('MongoDB brand kit fetch failed:', error);
    }
    return await dbService.getBrandKit();
  },

  clearComponents: async (): Promise<void> => {
    try {
      await mongoService.clearComponents();
    } catch (error) {
      console.warn('MongoDB clear failed, clearing IndexedDB:', error);
    }
    await dbService.clearComponents();
  }
};