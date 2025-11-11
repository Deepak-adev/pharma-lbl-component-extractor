interface CropLearningData {
  componentCategory: string;
  originalCrop: { x: number; y: number; width: number; height: number };
  userCrop: { x: number; y: number; width: number; height: number };
  timestamp: number;
}

class CropLearningService {
  private readonly STORAGE_KEY = 'pharma_crop_learning_data';
  private learningData: CropLearningData[] = [];

  constructor() {
    this.loadLearningData();
  }

  private loadLearningData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.learningData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load crop learning data:', error);
      this.learningData = [];
    }
  }

  private saveLearningData(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.learningData));
    } catch (error) {
      console.error('Failed to save crop learning data:', error);
    }
  }

  recordCropAdjustment(
    componentCategory: string,
    originalCrop: { x: number; y: number; width: number; height: number },
    userCrop: { x: number; y: number; width: number; height: number }
  ): void {
    const learningEntry: CropLearningData = {
      componentCategory,
      originalCrop,
      userCrop,
      timestamp: Date.now()
    };

    this.learningData.push(learningEntry);
    
    // Keep only last 100 entries per category
    const categoryData = this.learningData.filter(d => d.componentCategory === componentCategory);
    if (categoryData.length > 100) {
      this.learningData = this.learningData.filter(d => 
        d.componentCategory !== componentCategory || 
        d.timestamp >= categoryData.sort((a, b) => b.timestamp - a.timestamp)[99].timestamp
      );
    }

    this.saveLearningData();
  }

  getSmartCropSuggestion(
    componentCategory: string,
    originalCrop: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number; width: number; height: number } | null {
    const categoryData = this.learningData.filter(d => d.componentCategory === componentCategory);
    
    if (categoryData.length < 3) {
      return null; // Need at least 3 examples to learn
    }

    // Calculate average adjustments
    let totalXAdjust = 0;
    let totalYAdjust = 0;
    let totalWidthAdjust = 0;
    let totalHeightAdjust = 0;

    categoryData.forEach(data => {
      totalXAdjust += data.userCrop.x - data.originalCrop.x;
      totalYAdjust += data.userCrop.y - data.originalCrop.y;
      totalWidthAdjust += data.userCrop.width - data.originalCrop.width;
      totalHeightAdjust += data.userCrop.height - data.originalCrop.height;
    });

    const avgXAdjust = totalXAdjust / categoryData.length;
    const avgYAdjust = totalYAdjust / categoryData.length;
    const avgWidthAdjust = totalWidthAdjust / categoryData.length;
    const avgHeightAdjust = totalHeightAdjust / categoryData.length;

    // Apply learned adjustments
    const suggestedCrop = {
      x: Math.max(0, Math.min(originalCrop.x + avgXAdjust, 90)),
      y: Math.max(0, Math.min(originalCrop.y + avgYAdjust, 90)),
      width: Math.max(10, Math.min(originalCrop.width + avgWidthAdjust, 100)),
      height: Math.max(10, Math.min(originalCrop.height + avgHeightAdjust, 100))
    };

    return suggestedCrop;
  }

  getLearningStats(): { [category: string]: number } {
    const stats: { [category: string]: number } = {};
    this.learningData.forEach(data => {
      stats[data.componentCategory] = (stats[data.componentCategory] || 0) + 1;
    });
    return stats;
  }
}

export const cropLearningService = new CropLearningService();