import type { ImageComponent, BrandKit } from '../types';

// MongoDB Atlas cloud storage service
class MongoService {
  private apiUrl = 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1';
  private apiKey = 'your-mongodb-atlas-api-key';
  private database = 'pharma_lbl_db';

  async saveComponent(component: ImageComponent): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/action/insertOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'components',
          database: this.database,
          dataSource: 'Cluster0',
          document: component
        })
      });
    } catch (error) {
      console.error('MongoDB save failed:', error);
      throw error;
    }
  }

  async saveComponents(components: ImageComponent[]): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/action/insertMany`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'components',
          database: this.database,
          dataSource: 'Cluster0',
          documents: components
        })
      });
    } catch (error) {
      console.error('MongoDB batch save failed:', error);
      throw error;
    }
  }

  async getComponents(): Promise<ImageComponent[]> {
    try {
      const response = await fetch(`${this.apiUrl}/action/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'components',
          database: this.database,
          dataSource: 'Cluster0'
        })
      });
      
      const result = await response.json();
      return result.documents || [];
    } catch (error) {
      console.error('MongoDB fetch failed:', error);
      return [];
    }
  }

  async deleteComponent(id: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/action/deleteOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'components',
          database: this.database,
          dataSource: 'Cluster0',
          filter: { id }
        })
      });
    } catch (error) {
      console.error('MongoDB delete failed:', error);
      throw error;
    }
  }

  async saveBrandKit(brandKit: BrandKit): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/action/replaceOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'brandkits',
          database: this.database,
          dataSource: 'Cluster0',
          filter: { id: 'default' },
          replacement: { ...brandKit, id: 'default' },
          upsert: true
        })
      });
    } catch (error) {
      console.error('MongoDB brand kit save failed:', error);
      throw error;
    }
  }

  async getBrandKit(): Promise<BrandKit | null> {
    try {
      const response = await fetch(`${this.apiUrl}/action/findOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'brandkits',
          database: this.database,
          dataSource: 'Cluster0',
          filter: { id: 'default' }
        })
      });
      
      const result = await response.json();
      if (result.document) {
        const { id, ...brandKit } = result.document;
        return brandKit;
      }
      return null;
    } catch (error) {
      console.error('MongoDB brand kit fetch failed:', error);
      return null;
    }
  }

  async clearComponents(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/action/deleteMany`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          collection: 'components',
          database: this.database,
          dataSource: 'Cluster0',
          filter: {}
        })
      });
    } catch (error) {
      console.error('MongoDB clear components failed:', error);
      throw error;
    }
  }
}

export const mongoService = new MongoService();